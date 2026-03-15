"""Arcaive — Query Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user
from models import UserInDB, QueryRequest, QueryResponse, ReasoningStep
from documents import documents_db

router = APIRouter(prefix="/query", tags=["Query"])


@router.post("/ask", response_model=QueryResponse)
async def ask_question(req: QueryRequest, user: UserInDB = Depends(get_current_user)):
    doc_ids = req.doc_id if isinstance(req.doc_id, list) else [req.doc_id]

    for did in doc_ids:
        doc = documents_db.get(did)
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document {did} not found")
        if doc["user_id"] != user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        if doc["status"] != "indexed":
            raise HTTPException(status_code=400, detail=f"Document {did} not indexed yet")

    # TODO: Replace with real PageIndex call
    # from pageindex_client import pageindex_client
    # response = pageindex_client.ask(req.question, doc_ids)

    return QueryResponse(
        answer=f"Mock response to: '{req.question}'\n\nConnect PageIndex API for real reasoning-based answers.",
        reasoning_path=[
            ReasoningStep(node_title="Document Root", node_id="root"),
            ReasoningStep(node_title="Relevant Section", node_id="n-mock", pages="pp. 12-18"),
        ],
        doc_id=req.doc_id,
    )
