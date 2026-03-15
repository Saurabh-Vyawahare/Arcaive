"""
Arcaive — FastAPI Entry Point

Run: uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from auth import router as auth_router
from documents import router as documents_router
from query import router as query_router

app = FastAPI(
    title="Arcaive",
    description="Reasoning-based document intelligence powered by PageIndex",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(query_router)


@app.get("/health", tags=["System"])
async def health():
    return {"status": "healthy", "service": "arcaive", "version": "0.1.0"}


@app.get("/", tags=["System"])
async def root():
    return {"message": "Arcaive API", "docs": "/docs"}
