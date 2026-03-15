"""Arcaive — Configuration"""

from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    PAGEINDEX_API_KEY: str = ""
    JWT_SECRET_KEY: str = "arcaive-dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"
    STORAGE_TYPE: str = "local"
    LOCAL_UPLOAD_DIR: str = "./uploads"

    model_config = {
        "env_file": str(Path(__file__).resolve().parent.parent / ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
Path(settings.LOCAL_UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
