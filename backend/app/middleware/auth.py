from fastapi import Header, HTTPException
from app.database.supabase_client import get_db
import logging

logger = logging.getLogger(__name__)

async def get_current_user(authorization: str = Header(None)) -> str:
    """
    Dependency to get the current authenticated user's ID from Supabase JWT.
    Extracts the token from the Authorization header and verifies it via Supabase.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split(" ")[1]
    db = get_db()
    
    try:
        # Verify token and get user info
        res = db.auth.get_user(token)
        if not res or not res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return res.user.id
    except Exception as e:
        logger.warning(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")
