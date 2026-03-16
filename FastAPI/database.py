"""
Arcaive — Database Layer (Supabase PostgreSQL)

This module handles all database operations using the Supabase Python client.
Supabase gives us a hosted PostgreSQL database with a REST API on top.

HOW IT WORKS:
─────────────
Instead of storing users in a Python dict (which dies on restart),
we now store them in a real PostgreSQL table hosted on Supabase.

Supabase Python client wraps their REST API:
  supabase.table("users").insert({...})   →  INSERT INTO users ...
  supabase.table("users").select("*")     →  SELECT * FROM users ...
  .eq("username", "saurabh")              →  WHERE username = 'saurabh'

It's SQL under the hood, but we interact via Python methods.

SETUP:
──────
1. Create project at supabase.com
2. Run create_tables.sql in SQL Editor
3. Copy Project URL + anon key to .env
"""

from supabase import create_client, Client
from config import settings
import logging

logger = logging.getLogger(__name__)

# ── Supabase Client ──────────────────────────────────────────
# This is a singleton — created once when the module loads,
# reused across all requests.

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """
    Get the Supabase client instance (lazy initialization).

    Uses SUPABASE_URL and SUPABASE_KEY from your .env file.
    """
    global _supabase_client

    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY must be set in .env\n"
                "Get them from: supabase.com → your project → Settings → API"
            )

        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY,
        )
        logger.info("Supabase client initialized")

    return _supabase_client


# ═══════════════════════════════════════════════════════════════
# USER DATABASE OPERATIONS
# These functions are the ONLY place that talks to the database.
# Everything else (auth.py, routes) calls these functions.
# ═══════════════════════════════════════════════════════════════

def create_user(username: str, email: str, hashed_password: str) -> dict:
    """
    Insert a new user into the database.

    Args:
        username: User's chosen username
        email: User's email (lowercased)
        hashed_password: bcrypt hash (NEVER store plain passwords)

    Returns:
        The created user record as a dict

    Raises:
        Exception if username or email already exists (unique constraint)
    """
    db = get_supabase()

    result = db.table("users").insert({
        "username": username,
        "email": email,
        "hashed_password": hashed_password,
    }).execute()

    if result.data:
        return result.data[0]

    raise Exception("Failed to create user")


def get_user_by_username(username: str) -> dict | None:
    """
    Look up a user by their username (case-insensitive).

    Returns the user dict or None if not found.
    """
    db = get_supabase()

    result = db.table("users") \
        .select("*") \
        .ilike("username", username) \
        .execute()

    if result.data and len(result.data) > 0:
        return result.data[0]

    return None


def get_user_by_email(email: str) -> dict | None:
    """
    Look up a user by their email (case-insensitive).

    Returns the user dict or None if not found.
    """
    db = get_supabase()

    result = db.table("users") \
        .select("*") \
        .ilike("email", email) \
        .execute()

    if result.data and len(result.data) > 0:
        return result.data[0]

    return None


def get_user_by_id(user_id: str) -> dict | None:
    """
    Look up a user by their UUID.

    This is called by get_current_user() when decoding JWT tokens.
    The JWT 'sub' field contains the user's UUID.
    """
    db = get_supabase()

    result = db.table("users") \
        .select("*") \
        .eq("id", user_id) \
        .execute()

    if result.data and len(result.data) > 0:
        return result.data[0]

    return None
