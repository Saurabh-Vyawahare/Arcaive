"""Arcaive — Document Management Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from datetime import datetime, timezone
import uuid

from auth import get_current_user
from models import UserInDB, DocumentUploadResponse, DocumentListItem, DocumentTreeResponse, TreeNode

router = APIRouter(prefix="/documents", tags=["Documents"])

# In-memory store
documents_db: dict[str, dict] = {}
user_documents: dict[str, list[str]] = {}


@router.post("/upload", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    user: UserInDB = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported")

    doc_id = f"pi-{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)

    documents_db[doc_id] = {
        "doc_id": doc_id, "user_id": user.id,
        "filename": file.filename, "pages": 0,
        "status": "processing", "created_at": now, "tree": None,
    }
    user_documents.setdefault(user.id, []).append(doc_id)

    return DocumentUploadResponse(
        doc_id=doc_id, filename=file.filename,
        pages=0, status="processing", created_at=now,
    )


@router.get("/", response_model=list[DocumentListItem])
async def list_documents(user: UserInDB = Depends(get_current_user)):
    doc_ids = user_documents.get(user.id, [])
    return [
        DocumentListItem(**{k: documents_db[d][k] for k in ["doc_id", "filename", "pages", "status", "created_at"]})
        for d in doc_ids if d in documents_db
    ]


@router.get("/{doc_id}/tree", response_model=DocumentTreeResponse)
async def get_tree(doc_id: str, user: UserInDB = Depends(get_current_user)):
    doc = documents_db.get(doc_id)
    if not doc or doc["user_id"] != user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc["status"] != "indexed":
        raise HTTPException(status_code=400, detail="Document still processing")

    return DocumentTreeResponse(
        doc_id=doc_id, filename=doc["filename"],
        tree=doc.get("tree") or TreeNode(title=doc["filename"], node_id="root", nodes=[]),
    )


@router.get("/{doc_id}/status")
async def get_status(doc_id: str, user: UserInDB = Depends(get_current_user)):
    doc = documents_db.get(doc_id)
    if not doc or doc["user_id"] != user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"doc_id": doc_id, "status": doc["status"]}
