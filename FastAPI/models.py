"""Arcaive — Pydantic Models (all schemas in one place)"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ── Auth ─────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    email: str

class UserInDB(BaseModel):
    id: str
    username: str
    email: str
    hashed_password: str
    created_at: datetime

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime


# ── Documents ────────────────────────────────────────────────

class DocumentUploadResponse(BaseModel):
    doc_id: str
    filename: str
    pages: int
    status: str = "processing"
    created_at: datetime

class DocumentListItem(BaseModel):
    doc_id: str
    filename: str
    pages: int
    status: str
    created_at: datetime

class TreeNode(BaseModel):
    title: str
    node_id: str
    start_index: Optional[int] = None
    end_index: Optional[int] = None
    summary: Optional[str] = None
    nodes: Optional[list["TreeNode"]] = None

class DocumentTreeResponse(BaseModel):
    doc_id: str
    filename: str
    tree: TreeNode


# ── Query ────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    doc_id: str | list[str]

class ReasoningStep(BaseModel):
    node_title: str
    node_id: str
    pages: Optional[str] = None

class QueryResponse(BaseModel):
    answer: str
    reasoning_path: list[ReasoningStep]
    doc_id: str | list[str]
