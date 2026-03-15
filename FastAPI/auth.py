"""
Arcaive — Authentication
JWT auth with bcrypt password hashing.
In-memory user store for now — swap to Supabase/PostgreSQL later.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
import uuid

from config import settings
from models import (
    RegisterRequest, LoginRequest, TokenResponse,
    UserInDB, UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── Password Hashing ─────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ── JWT ──────────────────────────────────────────────────────
security = HTTPBearer()

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None

# ── In-Memory User Store ─────────────────────────────────────
# Key = user_id, Value = UserInDB
users_db: dict[str, UserInDB] = {}
username_index: dict[str, str] = {}  # username → user_id
email_index: dict[str, str] = {}     # email → user_id

# ── Dependency: Get Current User ─────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserInDB:
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = users_db.get(payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ── Endpoints ────────────────────────────────────────────────

@router.post("/register", status_code=201)
async def register(req: RegisterRequest):
    """Create a new account."""
    if req.username.lower() in username_index:
        raise HTTPException(status_code=409, detail="Username already taken")
    if req.email.lower() in email_index:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user = UserInDB(
        id=user_id,
        username=req.username.strip(),
        email=req.email.lower().strip(),
        hashed_password=hash_password(req.password),
        created_at=datetime.now(timezone.utc),
    )
    users_db[user_id] = user
    username_index[user.username.lower()] = user_id
    email_index[user.email] = user_id

    return {"message": "Account created successfully", "username": user.username}


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Login and get JWT token."""
    user_id = username_index.get(req.username.lower())
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    user = users_db[user_id]
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        username=user.username,
        email=user.email,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: UserInDB = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse(
        id=user.id, username=user.username,
        email=user.email, created_at=user.created_at,
    )
