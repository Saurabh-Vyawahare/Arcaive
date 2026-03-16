"""
Arcaive — Database Layer (Supabase PostgreSQL)

Two tables:
  - users: auth data (id, username, email, hashed_password)
  - documents: uploaded PDFs (id, user_id, filename, pages, status, tree_json)
"""

from supabase import create_client, Client
from config import settings
import json
import logging

logger = logging.getLogger(__name__)

_supabase_client: Client | None = None


def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized")
    return _supabase_client


# ═══════════════════════════════════════════════════════════════
# USER OPERATIONS
# ═══════════════════════════════════════════════════════════════

def create_user(username: str, email: str, hashed_password: str) -> dict:
    db = get_supabase()
    result = db.table("users").insert({
        "username": username, "email": email, "hashed_password": hashed_password,
    }).execute()
    if result.data:
        return result.data[0]
    raise Exception("Failed to create user")

def get_user_by_username(username: str) -> dict | None:
    db = get_supabase()
    result = db.table("users").select("*").ilike("username", username).execute()
    return result.data[0] if result.data else None

def get_user_by_email(email: str) -> dict | None:
    db = get_supabase()
    result = db.table("users").select("*").ilike("email", email).execute()
    return result.data[0] if result.data else None

def get_user_by_id(user_id: str) -> dict | None:
    db = get_supabase()
    result = db.table("users").select("*").eq("id", user_id).execute()
    return result.data[0] if result.data else None


# ═══════════════════════════════════════════════════════════════
# DOCUMENT OPERATIONS
# ═══════════════════════════════════════════════════════════════

def create_document(user_id: str, filename: str) -> dict:
    """Insert a new document record (status=processing)."""
    db = get_supabase()
    result = db.table("documents").insert({
        "user_id": user_id,
        "filename": filename,
        "status": "processing",
    }).execute()
    if result.data:
        return result.data[0]
    raise Exception("Failed to create document record")


def update_document_tree(doc_id: str, tree_json: dict, pages: int) -> dict:
    """
    Update document after PageIndex finishes processing.
    Stores the tree JSON and sets status to 'indexed'.
    """
    db = get_supabase()
    result = db.table("documents").update({
        "tree_json": tree_json,
        "pages": pages,
        "status": "indexed",
    }).eq("id", doc_id).execute()
    if result.data:
        return result.data[0]
    raise Exception("Failed to update document")


def update_document_status(doc_id: str, status: str) -> None:
    """Update just the status (e.g. to 'failed')."""
    db = get_supabase()
    db.table("documents").update({"status": status}).eq("id", doc_id).execute()


def get_document_by_id(doc_id: str) -> dict | None:
    db = get_supabase()
    result = db.table("documents").select("*").eq("id", doc_id).execute()
    return result.data[0] if result.data else None


def get_user_documents(user_id: str) -> list[dict]:
    """Get all documents for a user, newest first."""
    db = get_supabase()
    result = db.table("documents") \
        .select("id, user_id, filename, pages, status, created_at") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .execute()
    return result.data or []
