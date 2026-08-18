"""
TTS Service — Tri-provider with automatic cascading fallback.

Provider priority:
  1. ElevenLabs  (primary — high quality, uses API key)
  2. OpenRouter  (fallback 1 — high quality TTS, uses API key)
  3. Edge TTS    (fallback 2 — Microsoft, free & unlimited, fires on previous failures)
"""

import asyncio
import io
import logging
import tempfile
import os
import httpx
import edge_tts

from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

ELEVENLABS_BASE = "https://api.elevenlabs.io/v1"
OPENROUTER_BASE = "https://openrouter.ai/api/v1"

# ── Edge TTS voice map (language → best Indian voice) ────────────────────────
EDGE_VOICE_MAP: dict[str, str] = {
    "en": "en-IN-NeerjaNeural",
    "hi": "hi-IN-SwaraNeural",
    "mr": "mr-IN-AarohiNeural",
    "gu": "gu-IN-DhwaniNeural",
    "ta": "ta-IN-PallaviNeural",
}
DEFAULT_EDGE_VOICE = "en-IN-NeerjaNeural"

class QuotaExceededError(Exception):
    """Raised when quota/auth is exhausted."""

# ─────────────────────────────────────────────────────────────────────────────
# ElevenLabs helpers
# ─────────────────────────────────────────────────────────────────────────────

async def elevenlabs_get_voices() -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            f"{ELEVENLABS_BASE}/voices",
            headers={"xi-api-key": settings.elevenlabs_api_key},
        )
        r.raise_for_status()
        data = r.json()
        return [
            {"voice_id": v["voice_id"], "name": v["name"], "provider": "elevenlabs"}
            for v in data.get("voices", [])
        ]

async def elevenlabs_tts(text: str, voice_id: str, stability: float = 0.5, similarity_boost: float = 0.75, speed: float = 1.0) -> bytes:
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": stability, "similarity_boost": similarity_boost, "speed": speed},
    }
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(
            f"{ELEVENLABS_BASE}/text-to-speech/{voice_id}",
            headers={"xi-api-key": settings.elevenlabs_api_key, "Content-Type": "application/json"},
            json=payload,
        )
        if r.status_code in (401, 402, 429, 422):
            raise QuotaExceededError(f"ElevenLabs error {r.status_code}")
        r.raise_for_status()
        return r.content

# ─────────────────────────────────────────────────────────────────────────────
# OpenRouter TTS helpers
# ─────────────────────────────────────────────────────────────────────────────

async def openrouter_get_voices() -> list[dict]:
    return [
        {"voice_id": "alloy", "name": "Alloy (Neutral)", "provider": "openrouter"},
        {"voice_id": "echo", "name": "Echo (Male)", "provider": "openrouter"},
        {"voice_id": "nova", "name": "Nova (Female)", "provider": "openrouter"},
    ]

async def openrouter_tts(text: str, voice_id: str, speed: float = 1.0) -> bytes:
    valid = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
    voice = voice_id if voice_id in valid else "alloy"
    
    payload = {
        "model": "openai/tts-1",
        "input": text,
        "voice": voice,
        "response_format": "mp3",
        "speed": speed,
    }
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "EduVoice AI",
    }
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(f"{OPENROUTER_BASE}/audio/speech", headers=headers, json=payload)
        if r.status_code in (401, 402, 429):
            raise QuotaExceededError(f"OpenRouter error {r.status_code}")
        r.raise_for_status()
        return r.content

# ─────────────────────────────────────────────────────────────────────────────
# Edge TTS helpers
# ─────────────────────────────────────────────────────────────────────────────

def speed_to_edge_rate(speed: float) -> str:
    pct = round((speed - 1.0) * 100)
    return f"{pct:+d}%"

async def edge_tts_generate(text: str, language: str = "en", rate: str = "+0%") -> bytes:
    voice = EDGE_VOICE_MAP.get(language, DEFAULT_EDGE_VOICE)
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate)
        await communicate.save(tmp_path)
        with open(tmp_path, "rb") as f:
            return f.read()
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

async def get_voices() -> list[dict]:
    try:
        if getattr(settings, 'elevenlabs_api_key', None):
            voices = await elevenlabs_get_voices()
            if voices: return voices
    except Exception as e:
        logger.warning(f"ElevenLabs fetch failed: {e}")
        
    try:
        if settings.openrouter_api_key:
            return await openrouter_get_voices()
    except Exception as e:
        logger.warning(f"OpenRouter fetch failed: {e}")

    return [
        {"voice_id": f"edge:{lang}", "name": label, "provider": "edge"}
        for lang, label in {
            "en": "Neerja (English India) — Free",
            "hi": "Swara (Hindi) — Free",
        }.items()
    ]

async def generate_speech(
    text: str, voice_id: str = "", language: str = "en", emotion: str = "neutral",
    speed: float = 1.0, stability: float = 0.5, similarity_boost: float = 0.75
) -> tuple[bytes, str]:

    if voice_id.startswith("edge:"):
        return await edge_tts_generate(text, voice_id.split(":", 1)[1], speed_to_edge_rate(speed)), "edge_tts"

    # 1. Try ElevenLabs
    if getattr(settings, 'elevenlabs_api_key', None) and voice_id:
        try:
            audio = await elevenlabs_tts(text, voice_id, stability, similarity_boost, speed)
            return audio, "elevenlabs"
        except Exception as e:
            logger.warning(f"ElevenLabs failed ({e}) — falling back to OpenRouter TTS")

    # 2. Try OpenRouter
    if settings.openrouter_api_key:
        try:
            audio = await openrouter_tts(text, voice_id, speed)
            return audio, "openrouter"
        except Exception as e:
            logger.warning(f"OpenRouter failed ({e}) — falling back to Edge TTS")

    # 3. Try Edge TTS
    audio = await edge_tts_generate(text, language, speed_to_edge_rate(speed))
    return audio, "edge_tts"
