"""
Arcaive — PageIndex Service
═══════════════════════════════════════════════════════════════

THIS IS THE CORE OF THE ENTIRE APPLICATION.

Two main functions:
  1. generate_tree(pdf_path) → builds hierarchical tree from PDF
  2. query_document(question, tree_json, pdf_path) → answers using tree reasoning

HOW IT WORKS (step by step):
─────────────────────────────

TREE GENERATION:
  PDF → PyMuPDF extracts text page by page
      → GPT-4o reads pages, identifies section structure
      → Builds hierarchical tree (like intelligent table of contents)
      → Each node: title, summary, page range, child nodes

QUERY (RAG via tree reasoning):
  Question + Tree → GPT-4o looks at tree structure
      → Reasons: "this question is about X → Section 3 covers X"
      → Identifies relevant node IDs
      → We extract text from those pages (PyMuPDF)
      → GPT-4o reads the extracted text + question → generates answer
      → Returns: answer + reasoning path (which nodes it traversed)

This is NOT vector RAG. No embeddings, no cosine similarity, no chunking.
The LLM THINKS about where the answer lives, then reads those pages.
═══════════════════════════════════════════════════════════════
"""

import json
import os
import asyncio
import logging
import fitz  # PyMuPDF
import openai
from config import settings

# Import the open-source PageIndex tree generator
from pageindex import page_index_main, config as pi_config

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════
# 1. TREE GENERATION
# Takes a PDF file → returns hierarchical tree JSON
# ═══════════════════════════════════════════════════════════════

def generate_tree(pdf_path: str, model: str = "gpt-4o") -> dict:
    """
    Generate a PageIndex tree structure from a PDF.

    This calls the open-source PageIndex code which:
    1. Extracts text from each page using PyMuPDF
    2. Checks for existing table of contents
    3. Uses GPT-4o to identify section boundaries
    4. Builds a hierarchical tree with summaries

    Args:
        pdf_path: Path to the PDF file on disk
        model: OpenAI model to use (default gpt-4o)

    Returns:
        dict with keys: doc_name, structure (the tree)

    Cost: roughly $0.01-0.05 per page depending on content density
    Time: 30-120 seconds for a 50-page document
    """
    logger.info(f"Starting tree generation for: {pdf_path}")

    # Configure PageIndex options
    opt = pi_config(
        model=model,
        toc_check_page_num=20,        # Check first 20 pages for existing TOC
        max_page_num_each_node=10,     # Max 10 pages per tree node
        max_token_num_each_node=20000, # Max 20K tokens per node
        if_add_node_id="yes",          # Add unique IDs to nodes
        if_add_node_summary="yes",     # Generate summaries for each section
        if_add_doc_description="yes",  # Add overall document description
        if_add_node_text="yes",        # Include extracted text in nodes (needed for query)
    )

    # Run PageIndex — this makes multiple GPT-4o calls
    tree_structure = page_index_main(pdf_path, opt)

    logger.info(f"Tree generation complete for: {pdf_path}")
    return tree_structure


def count_pdf_pages(pdf_path: str) -> int:
    """Count pages in a PDF using PyMuPDF."""
    doc = fitz.open(pdf_path)
    count = len(doc)
    doc.close()
    return count


# ═══════════════════════════════════════════════════════════════
# 2. QUERY — Reasoning-based retrieval
# Takes question + tree → finds answer via tree reasoning
# ═══════════════════════════════════════════════════════════════

async def _call_llm(prompt: str, model: str = "gpt-4o") -> str:
    """Call OpenAI GPT-4o asynchronously."""
    client = openai.AsyncOpenAI(api_key=settings.CHATGPT_API_KEY)
    response = await client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )
    return response.choices[0].message.content.strip()


def _build_node_map(tree: dict | list, node_map: dict = None) -> dict:
    """
    Flatten the tree into a dict: node_id → node data.
    This lets us quickly look up any node by its ID.
    """
    if node_map is None:
        node_map = {}

    if isinstance(tree, list):
        for node in tree:
            _build_node_map(node, node_map)
    elif isinstance(tree, dict):
        if "node_id" in tree:
            node_map[tree["node_id"]] = tree
        if "nodes" in tree and tree["nodes"]:
            for child in tree["nodes"]:
                _build_node_map(child, node_map)
        if "structure" in tree:
            _build_node_map(tree["structure"], node_map)

    return node_map


def _strip_text_from_tree(tree: dict) -> dict:
    """
    Remove 'text' fields from tree for the search prompt.
    We don't want to send full page text to the search step —
    just titles and summaries so the LLM can reason about structure.
    """
    import copy
    clean = copy.deepcopy(tree)

    def _remove(node):
        if isinstance(node, dict):
            node.pop("text", None)
            if "nodes" in node and node["nodes"]:
                for child in node["nodes"]:
                    _remove(child)
        elif isinstance(node, list):
            for item in node:
                _remove(item)

    if "structure" in clean:
        _remove(clean["structure"])
    else:
        _remove(clean)

    return clean


def _extract_pages(pdf_path: str, start_page: int, end_page: int) -> str:
    """Extract text from specific pages of a PDF using PyMuPDF."""
    doc = fitz.open(pdf_path)
    text_parts = []
    for page_num in range(max(0, start_page - 1), min(end_page, len(doc))):
        page = doc[page_num]
        text_parts.append(f"--- Page {page_num + 1} ---\n{page.get_text()}")
    doc.close()
    return "\n\n".join(text_parts)


async def query_document(
    question: str,
    tree_json: dict,
    pdf_path: str,
    model: str = "gpt-4o",
) -> dict:
    """
    Answer a question using reasoning-based retrieval.

    THE FLOW:
    ─────────
    Step 1: TREE SEARCH (reasoning)
      - Send the tree structure (titles + summaries, no text) to GPT-4o
      - Ask: "which nodes contain the answer to this question?"
      - GPT-4o reasons through the tree and returns node IDs

    Step 2: CONTEXT EXTRACTION
      - For each identified node, get its page range
      - Extract actual text from those pages using PyMuPDF

    Step 3: ANSWER GENERATION
      - Send extracted text + question to GPT-4o
      - Get the final answer

    Returns:
      {
        "answer": "The report identifies three risk factors...",
        "thinking": "The question asks about regulatory compliance...",
        "reasoning_path": [
          {"node_id": "0003", "title": "Risk Factors", "pages": "7-28"},
          ...
        ]
      }
    """
    logger.info(f"Query: {question[:100]}...")

    # ── Step 1: Tree Search ──────────────────────────────────
    # Strip text from tree (only send structure for reasoning)
    tree_for_search = _strip_text_from_tree(tree_json)

    search_prompt = f"""You are given a question and a tree structure of a document.
Each node contains a node_id, title, and summary.
Your task is to find all nodes that are likely to contain the answer to the question.

Question: {question}

Document tree structure:
{json.dumps(tree_for_search, indent=2)}

Reply in this JSON format:
{{
    "thinking": "<Your reasoning about which sections are relevant>",
    "node_list": ["node_id_1", "node_id_2"]
}}
Return only the JSON. No other text."""

    search_result_raw = await _call_llm(search_prompt, model)

    # Parse the search result
    try:
        # Handle potential markdown code blocks in response
        clean = search_result_raw.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1].rsplit("```", 1)[0]
        search_result = json.loads(clean)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse tree search result: {search_result_raw}")
        search_result = {"thinking": "Error parsing", "node_list": []}

    thinking = search_result.get("thinking", "")
    node_ids = search_result.get("node_list", [])

    # ── Step 2: Extract Context ──────────────────────────────
    node_map = _build_node_map(tree_json)
    reasoning_path = []
    context_parts = []

    for nid in node_ids:
        node = node_map.get(nid)
        if not node:
            continue

        start = node.get("start_index", 1)
        end = node.get("end_index", start)
        title = node.get("title", "Unknown")

        reasoning_path.append({
            "node_id": nid,
            "title": title,
            "pages": f"pp. {start}-{end}" if start != end else f"p. {start}",
        })

        # Get text: either from tree (if stored) or extract from PDF
        if "text" in node and node["text"]:
            context_parts.append(f"[{title}]\n{node['text']}")
        else:
            extracted = _extract_pages(pdf_path, start, end)
            context_parts.append(f"[{title}]\n{extracted}")

    context = "\n\n".join(context_parts)

    if not context.strip():
        return {
            "answer": "I couldn't find relevant sections in the document for this question.",
            "thinking": thinking,
            "reasoning_path": reasoning_path,
        }

    # ── Step 3: Generate Answer ──────────────────────────────
    answer_prompt = f"""Answer the question based on the provided context from a document.
Be specific, cite page numbers when possible, and be concise.

Question: {question}

Context:
{context[:15000]}

Provide a clear, detailed answer based only on the context provided."""

    answer = await _call_llm(answer_prompt, model)

    logger.info(f"Query answered. Nodes used: {[n['node_id'] for n in reasoning_path]}")

    return {
        "answer": answer,
        "thinking": thinking,
        "reasoning_path": reasoning_path,
    }
