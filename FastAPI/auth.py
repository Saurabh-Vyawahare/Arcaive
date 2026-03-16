"""
Arcaive — Authentication (Supabase PostgreSQL)

WHAT CHANGED FROM IN-MEMORY VERSION:
  Before:  users_db = {}  (dies on restart)
  Now:     database.py → Supabase PostgreSQL (persists forever)

Everything else is identical — JWT, bcrypt, endpoints, dependencies.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext

from config import settings
from models import RegisterRequest, LoginRequest, TokenResponse, UserInDB, UserResponse
from database import create_user, get_user_by_username, get_user_by_email, get_user_by_id

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

# ── Dependency: Get Current User ─────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserInDB:
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user_data = get_user_by_id(user_id)
    if not user_data:
        raise HTTPException(status_code=401, detail="User not found")

    return UserInDB(
        id=user_data["id"],
        username=user_data["username"],
        email=user_data["email"],
        hashed_password=user_data["hashed_password"],
        created_at=user_data["created_at"],
    )


# ── Endpoints ────────────────────────────────────────────────

@router.post("/register", status_code=201)
async def register(req: RegisterRequest):
    """Create a new account → stores in Supabase PostgreSQL."""
    if get_user_by_username(req.username.strip()):
        raise HTTPException(status_code=409, detail="Username already taken")
    if get_user_by_email(req.email.strip()):
        raise HTTPException(status_code=409, detail="Email already registered")

    try:
        user_data = create_user(
            username=req.username.strip(),
            email=req.email.lower().strip(),
            hashed_password=hash_password(req.password),
        )
        return {"message": "Account created successfully", "username": user_data["username"]}
    except Exception as e:
        error_msg = str(e)
        if "duplicate" in error_msg.lower() or "unique" in error_msg.lower():
            raise HTTPException(status_code=409, detail="Username or email already exists")
        raise HTTPException(status_code=500, detail=f"Registration failed: {error_msg}")


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Login → verify password → return JWT token."""
    user_data = get_user_by_username(req.username.strip())
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not verify_password(req.password, user_data["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_token(user_data["id"])
    return TokenResponse(access_token=token, username=user_data["username"], email=user_data["email"])


@router.get("/me", response_model=UserResponse)
async def get_me(user: UserInDB = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse(id=user.id, username=user.username, email=user.email, created_at=user.created_at)
