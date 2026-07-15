"""
Supabase database client.
Uses service-role key so it bypasses RLS for backend operations.
"""

from supabase import create_client, Client
from app.config.settings import get_settings

_client: Client | None = None


def get_db() -> Client:
    global _client
    if _client is None:
        s = get_settings()
        if not s.supabase_url or not s.supabase_service_key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
        _client = create_client(s.supabase_url, s.supabase_service_key)
    return _client
