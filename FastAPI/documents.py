"""
Arcaive — Document Endpoints

POST /documents/upload  → Save PDF + trigger tree generation
GET  /documents/        → List user's documents
GET  /documents/{id}/tree → Get the tree structure
GET  /documents/{id}/status → Check if still processing

WHAT HAPPENS ON UPLOAD:
  1. FastAPI receives the PDF file
  2. Saves it to ./uploads/{user_id}/{doc_id}.pdf
  3. Creates a record in Supabase (status: "processing")
  4. Runs PageIndex tree generation in background
  5. Once done, stores tree JSON in Supabase (status: "indexed")
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from pathlib import Path
import shutil
import logging

from config import settings
from auth import get_current_user
from models import UserInDB
from database import (
    create_document,
    update_document_tree,
    update_document_status,
    get_document_by_id,
    get_user_documents,
    delete_document,
)
from pageindex_service import generate_tree, count_pdf_pages

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])


def _get_pdf_path(user_id: str, doc_id: str) -> str:
    """Get the local file path for a user's document."""
    return str(Path(settings.UPLOAD_DIR) / user_id / f"{doc_id}.pdf")


def _process_document(doc_id: str, user_id: str, pdf_path: str):
    """
    Background task: Run PageIndex on the uploaded PDF.

    This runs AFTER the upload response is sent — the user doesn't
    have to wait for tree generation (can take 30-120 seconds).
    They poll /documents/{id}/status to check progress.
    """
    try:
        logger.info(f"Processing document {doc_id}: {pdf_path}")

        # Count pages
        pages = count_pdf_pages(pdf_path)

        # Generate tree using PageIndex (this calls GPT-4o multiple times)
        tree_json = generate_tree(pdf_path)

        # Save tree + page count to Supabase
        update_document_tree(doc_id, tree_json, pages)

        logger.info(f"Document {doc_id} indexed successfully ({pages} pages)")

    except Exception as e:
        logger.error(f"Failed to process document {doc_id}: {e}")
        update_document_status(doc_id, "failed")


# ── ENDPOINTS ────────────────────────────────────────────────

@router.post("/upload", status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: UserInDB = Depends(get_current_user),
):
    """
    Upload a PDF document for processing.

    Returns immediately with doc_id — tree generation runs in background.
    Poll /documents/{doc_id}/status to check when it's ready.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Create record in Supabase (status: processing)
    doc_record = create_document(user_id=user.id, filename=file.filename)
    doc_id = doc_record["id"]

    # Save PDF to local disk
    user_dir = Path(settings.UPLOAD_DIR) / user.id
    user_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = str(user_dir / f"{doc_id}.pdf")

    with open(pdf_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    logger.info(f"PDF saved: {pdf_path}")

    # Kick off tree generation in background
    background_tasks.add_task(_process_document, doc_id, user.id, pdf_path)

    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "status": "processing",
        "message": "Upload successful. Tree generation started — poll /documents/{doc_id}/status",
    }


@router.get("/")
async def list_documents(user: UserInDB = Depends(get_current_user)):
    """List all documents for the current user."""
    docs = get_user_documents(user.id)
    return docs


@router.get("/{doc_id}/status")
async def get_status(doc_id: str, user: UserInDB = Depends(get_current_user)):
    """Check processing status of a document."""
    doc = get_document_by_id(doc_id)
    if not doc or doc["user_id"] != user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"doc_id": doc_id, "status": doc["status"], "pages": doc.get("pages", 0)}


@router.get("/{doc_id}/tree")
async def get_tree(doc_id: str, user: UserInDB = Depends(get_current_user)):
    """Get the PageIndex tree structure for a document."""
    doc = get_document_by_id(doc_id)
    if not doc or doc["user_id"] != user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc["status"] != "indexed":
        raise HTTPException(status_code=400, detail=f"Document status: {doc['status']}. Wait for 'indexed'.")
    return {
        "doc_id": doc_id,
        "filename": doc["filename"],
        "pages": doc["pages"],
        "tree": doc["tree_json"],
    }


@router.delete("/{doc_id}")
async def remove_document(doc_id: str, user: UserInDB = Depends(get_current_user)):
    """Delete a document and its PDF from disk."""
    doc = get_document_by_id(doc_id)
    if not doc or doc["user_id"] != user.id:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete PDF from disk
    pdf_path = Path(settings.UPLOAD_DIR) / user.id / f"{doc_id}.pdf"
    if pdf_path.exists():
        pdf_path.unlink()

    # Delete from database
    delete_document(doc_id)

    return {"message": "Document deleted", "doc_id": doc_id}
