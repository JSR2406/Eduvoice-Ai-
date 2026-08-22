from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Project ────────────────────────────────────────────────────────────
    project_name: str = "EduVoice AI"
    version:      str = "2.0.0"

    # ── Supabase ───────────────────────────────────────────────────────────
    supabase_url:         str = ""
    supabase_service_key: str = ""
    supabase_anon_key:    str = ""

    # ── Sarvam AI (PRIMARY — sovereign Indian AI) ──────────────────────────
    # Get your key: https://dashboard.sarvam.ai/key-management
    sarvam_api_key:            str = ""
    sarvam_base_url:           str = "https://api.sarvam.ai"
    sarvam_chat_model:         str = "sarvam-105b-conversations"
    sarvam_tts_model:          str = "bulbul:v3"
    sarvam_translation_model:  str = "mayura:v1"

    # ── Legacy AI (kept for fallback / migration period) ───────────────────
    elevenlabs_api_key: str = ""
    openrouter_api_key: str = ""

    # ── Real-Time Voice & Multi-Agent ───────────────────────────────────────
    websocket_host: str = "0.0.0.0"
    websocket_port: int = 8765
    max_audio_chunk_size: int = 4096
    streaming_latency_target_ms: int = 500
    redis_url: str = "redis://localhost:6379/0"

    # ── App ────────────────────────────────────────────────────────────────
    cors_origins: str = "*"
    secret_key: str = "changeme"
    debug:      bool = True

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
