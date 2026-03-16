"""
Arcaive — Query Endpoint

POST /query/ask → Ask a question about an indexed document

THE MAGIC HAPPENS HERE:
  1. User asks: "What are the risk factors?"
  2. We load the tree from Supabase
  3. GPT-4o reasons THROUGH the tree: "Risk factors → Section 2 → pages 7-28"
  4. We extract text from those exact pages
  5. GPT-4o reads the text and generates an answer
  6. We return: answer + reasoning path (which nodes were traversed)

This is fundamentally different from vector RAG:
  Vector RAG: embed → cosine similarity → hope you got the right chunks
  Arcaive:    tree → LLM reasons about structure → precise pages → answer
"""

from fastapi import APIRouter, Depends, HTTPException
from pathlib import Path
import logging

from config import settings
from auth import get_current_user
from models import UserInDB, QueryRequest, QueryResponse, ReasoningStep
from database import get_document_by_id
from pageindex_service import query_document

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/query", tags=["Query"])


@router.post("/ask", response_model=QueryResponse)
async def ask_question(req: QueryRequest, user: UserInDB = Depends(get_current_user)):
    """
    Ask a question about an indexed document.

    Requires:
      - question: what you want to know
      - doc_id: which document to query (must be status: "indexed")

    Returns:
      - answer: the LLM's response
      - reasoning_path: which tree nodes were used (with page numbers)
    """
    # Handle single doc_id (multi-doc query is future enhancement)
    doc_id = req.doc_id if isinstance(req.doc_id, str) else req.doc_id[0]

    # Fetch document from Supabase
    doc = get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc["user_id"] != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if doc["status"] != "indexed":
        raise HTTPException(status_code=400, detail=f"Document not indexed yet (status: {doc['status']})")

    tree_json = doc.get("tree_json")
    if not tree_json:
        raise HTTPException(status_code=400, detail="No tree structure found for this document")

    # Build the PDF path
    pdf_path = str(Path(settings.UPLOAD_DIR) / user.id / f"{doc_id}.pdf")
    if not Path(pdf_path).exists():
        raise HTTPException(status_code=404, detail="PDF file not found on disk")

    # ── THE CORE: Reasoning-based retrieval ───────────────
    try:
        result = await query_document(
            question=req.question,
            tree_json=tree_json,
            pdf_path=pdf_path,
        )
    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

    # Build response with reasoning path
    reasoning_path = [
        ReasoningStep(
            node_title=step["title"],
            node_id=step["node_id"],
            pages=step.get("pages"),
        )
        for step in result.get("reasoning_path", [])
    ]

    return QueryResponse(
        answer=result["answer"],
        reasoning_path=reasoning_path,
        doc_id=doc_id,
    )
