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

def generate_tree(pdf_path: str, model: str = None) -> dict:
    """
    Generate a PageIndex tree structure from a PDF.

    MODEL STRATEGY:
    ───────────────
    Tree generation = structural work (finding sections, titles, boundaries).
    GPT-4.1 is ideal: 40% faster than GPT-4o, better instruction following
    (87.4% vs 81%), 26% cheaper, and 1M token context.

    Queries use GPT-5.4 separately (configured in query_document).
    """
    logger.info(f"Starting tree generation for: {pdf_path}")

    pages = count_pdf_pages(pdf_path)
    logger.info(f"Document has {pages} pages")

    # GPT-5.1: 500K TPM — no rate limiting, high accuracy
    # Tiktoken patched in pageindex/utils.py to handle gpt-5.x models
    tree_model = model or "gpt-5.1"

    if pages <= 50:
        # SPEED MODE: skip summaries (saves ~8 sec), use text previews for queries instead
        opt = pi_config(
            model=tree_model,
            toc_check_page_num=3,
            max_page_num_each_node=25,
            max_token_num_each_node=35000,
            if_add_node_id="yes",
            if_add_node_summary="no",       # Skip — queries use text previews instead
            if_add_doc_description="no",
            if_add_node_text="yes",          # Keep full text for accurate retrieval
        )
    else:
        opt = pi_config(
            model=tree_model,
            toc_check_page_num=5,
            max_page_num_each_node=20,
            max_token_num_each_node=30000,
            if_add_node_id="yes",
            if_add_node_summary="yes",       # Keep for large docs (worth the time)
            if_add_doc_description="no",
            if_add_node_text="yes",
        )

    tree_structure = page_index_main(pdf_path, opt)

    logger.info(f"Tree generation complete for: {pdf_path} ({pages} pages)")
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

async def _call_llm(prompt: str, model: str = "gpt-5.4") -> str:
    """Call OpenAI asynchronously. Default: GPT-5.4 for queries."""
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
    Prepare tree for the search prompt.
    Instead of full text, include a SHORT PREVIEW (first 300 chars) per node.
    This gives the LLM enough context to reason about relevance
    without needing pre-generated summaries.
    """
    import copy
    clean = copy.deepcopy(tree)

    def _trim(node):
        if isinstance(node, dict):
            # If no summary exists, create a preview from text
            if not node.get("summary") and node.get("text"):
                text = node["text"].strip()
                node["preview"] = text[:300] + "..." if len(text) > 300 else text
            # Remove full text (too large for search prompt)
            node.pop("text", None)
            if "nodes" in node and node["nodes"]:
                for child in node["nodes"]:
                    _trim(child)
        elif isinstance(node, list):
            for item in node:
                _trim(item)

    if "structure" in clean:
        _trim(clean["structure"])
    else:
        _trim(clean)

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
    pdf_path: str = None,
    model: str = "gpt-5.4",
) -> dict:
    """
    Answer a question using reasoning-based retrieval.
    Uses GPT-5.4 (newest, smartest) for best accuracy + typo tolerance.
    """
    logger.info(f"Query: {question[:100]}...")

    # ── Step 1: Tree Search ──────────────────────────────────
    # Strip text from tree (only send structure for reasoning)
    tree_for_search = _strip_text_from_tree(tree_json)

    search_prompt = f"""You are a document retrieval expert. A user is asking a question about a document.
Your job is to find ALL nodes in the document tree that could contain the answer.

IMPORTANT RULES:
- The user's question may contain spelling mistakes, grammatical errors, or informal language. Interpret what they MEAN, not what they literally wrote.
- Be generous with your selection. If a node MIGHT be relevant, include it. It is better to include too many nodes than to miss the right one.
- Look at node titles, summaries, AND text previews to determine relevance.
- If the question is vague or broad, include all sections that could possibly relate to it.

User's question: {question}

Document tree structure:
{json.dumps(tree_for_search, indent=2)}

Reply in this exact JSON format:
{{
    "thinking": "<Your reasoning about what the user is asking and which sections are relevant>",
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
        elif pdf_path:
            extracted = _extract_pages(pdf_path, start, end)
            context_parts.append(f"[{title}]\n{extracted}")
        elif "summary" in node and node["summary"]:
            # Fallback: use node summary if no PDF and no text
            context_parts.append(f"[{title}]\n{node['summary']}")

    context = "\n\n".join(context_parts)

    if not context.strip():
        return {
            "answer": "I couldn't find relevant sections in the document for this question.",
            "thinking": thinking,
            "reasoning_path": reasoning_path,
        }

    # ── Step 3: Generate Answer ──────────────────────────────
    answer_prompt = f"""You are Arcaive, a document intelligence assistant. Answer the question based ONLY on the provided context extracted from a document.

Rules:
- The user's question may contain typos, spelling mistakes, or grammatical errors. Focus on what they are trying to ask, not how they wrote it.
- Be specific and detailed in your answer.
- Cite page numbers when available.
- If the context contains relevant information, extract and present it thoroughly.
- If the context only contains summaries, provide what you can and note that more detail may be available in the full document.
- Never say "the context does not contain information about X" if the context clearly does discuss it, even if the user's wording doesn't exactly match the document's terminology.

Question: {question}

Context from document:
{context[:30000]}

Provide a comprehensive answer based on the context provided."""

    answer = await _call_llm(answer_prompt, model)

    logger.info(f"Query answered. Nodes used: {[n['node_id'] for n in reasoning_path]}")

    return {
        "answer": answer,
        "thinking": thinking,
        "reasoning_path": reasoning_path,
    }
