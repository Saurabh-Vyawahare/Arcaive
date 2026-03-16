"""Arcaive — Configuration"""

from pydantic_settings import BaseSettings
from pathlib import Path
import os


class Settings(BaseSettings):
    # ── Supabase ───────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # ── OpenAI (used by PageIndex for tree generation + queries)
    CHATGPT_API_KEY: str = ""

    # ── JWT ────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "arcaive-dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    # ── Server ─────────────────────────────────────────────
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Storage ────────────────────────────────────────────
    UPLOAD_DIR: str = "./uploads"

    model_config = {
        "env_file": str(Path(__file__).resolve().parent.parent / ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()

# Ensure upload dir exists
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# Set OpenAI key as environment variable (PageIndex reads from env)
if settings.CHATGPT_API_KEY:
    os.environ["CHATGPT_API_KEY"] = settings.CHATGPT_API_KEY
