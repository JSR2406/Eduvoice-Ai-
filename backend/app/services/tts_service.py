"""
TTS Service — Dual-provider with automatic fallback.

Provider priority:
  1. ElevenLabs  (primary — high quality, uses API key)
  2. Edge TTS    (fallback — Microsoft, free & unlimited, fires on ElevenLabs 401/429/quota error)

Edge TTS voices support English, Hindi, Marathi, Gujarati, Tamil, and 300+ others.
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

# ── Edge TTS voice map (language → best Indian voice) ────────────────────────
EDGE_VOICE_MAP: dict[str, str] = {
    "en": "en-IN-NeerjaNeural",      # English (Indian female)
    "hi": "hi-IN-SwaraNeural",       # Hindi (female)
    "mr": "mr-IN-AarohiNeural",      # Marathi (female)
    "gu": "gu-IN-DhwaniNeural",      # Gujarati (female)
    "ta": "ta-IN-PallaviNeural",     # Tamil (female)
}

# Fallback if language not found
DEFAULT_EDGE_VOICE = "en-IN-NeerjaNeural"


# ─────────────────────────────────────────────────────────────────────────────
# ElevenLabs helpers
# ─────────────────────────────────────────────────────────────────────────────

async def elevenlabs_get_voices() -> list[dict]:
    """Fetch available ElevenLabs voices."""
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            f"{ELEVENLABS_BASE}/voices",
            headers={"xi-api-key": settings.elevenlabs_api_key},
        )
        r.raise_for_status()
        data = r.json()
        return [
            {"voice_id": v["voice_id"], "name": v["name"], "labels": v.get("labels", {})}
            for v in data.get("voices", [])
        ]


async def elevenlabs_tts(
    text: str,
    voice_id: str,
    stability: float = 0.5,
    similarity_boost: float = 0.75,
    speed: float = 1.0,
) -> bytes:
    """Generate speech via ElevenLabs. Returns MP3 bytes."""
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability":        stability,
            "similarity_boost": similarity_boost,
            "speed":            speed,
        },
    }
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(
            f"{ELEVENLABS_BASE}/text-to-speech/{voice_id}",
            headers={
                "xi-api-key":   settings.elevenlabs_api_key,
                "Content-Type": "application/json",
                "Accept":       "audio/mpeg",
            },
            json=payload,
        )
        if r.status_code in (401, 429, 422):
            raise QuotaExceededError(f"ElevenLabs returned {r.status_code}: {r.text[:200]}")
        r.raise_for_status()
        return r.content


# ─────────────────────────────────────────────────────────────────────────────
# Edge TTS helpers (free, unlimited)
# ─────────────────────────────────────────────────────────────────────────────

class QuotaExceededError(Exception):
    """Raised when ElevenLabs quota is exhausted."""


async def edge_tts_generate(text: str, language: str = "en", rate: str = "+0%") -> bytes:
    """
    Generate speech using Microsoft Edge TTS.
    Returns MP3 bytes — completely free, no API key required.
    """
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


def speed_to_edge_rate(speed: float) -> str:
    """Convert numeric speed (0.5–2.0) to Edge TTS rate string (+/-XX%)."""
    pct = round((speed - 1.0) * 100)
    return f"{pct:+d}%"


# ─────────────────────────────────────────────────────────────────────────────
# Public API — used by routes
# ─────────────────────────────────────────────────────────────────────────────

async def get_voices() -> list[dict]:
    """
    Returns voice list. Tries ElevenLabs first; falls back to Edge TTS voices.
    """
    try:
        if settings.elevenlabs_api_key:
            voices = await elevenlabs_get_voices()
            if voices:
                return voices
    except Exception as e:
        logger.warning("ElevenLabs voices fetch failed, using Edge TTS list: %s", e)

    # Return Edge TTS voices as static list
    return [
        {"voice_id": f"edge:{lang}", "name": label, "provider": "edge"}
        for lang, label in {
            "en": "Neerja (English India Female) — Free",
            "hi": "Swara (Hindi Female) — Free",
            "mr": "Aarohi (Marathi Female) — Free",
            "gu": "Dhwani (Gujarati Female) — Free",
            "ta": "Pallavi (Tamil Female) — Free",
        }.items()
    ]


async def generate_speech(
    text: str,
    voice_id: str = "",
    language: str = "en",
    emotion: str = "neutral",
    speed: float = 1.0,
    stability: float = 0.5,
    similarity_boost: float = 0.75,
) -> tuple[bytes, str]:
    """
    Generate speech audio. Returns (mp3_bytes, provider_used).

    Strategy:
      1. If voice_id starts with 'edge:' → go straight to Edge TTS.
      2. Otherwise try ElevenLabs.
      3. If ElevenLabs fails with quota/auth error → auto-fallback to Edge TTS.
      4. Edge TTS errors are not silenced (raised to caller).
    """
    # Direct Edge TTS request
    if voice_id.startswith("edge:"):
        lang = voice_id.split(":", 1)[1]
        audio = await edge_tts_generate(text, lang, speed_to_edge_rate(speed))
        return audio, "edge_tts"

    # Try ElevenLabs
    if settings.elevenlabs_api_key and voice_id:
        try:
            audio = await elevenlabs_tts(text, voice_id, stability, similarity_boost, speed)
            logger.info("Audio generated via ElevenLabs (voice=%s)", voice_id)
            return audio, "elevenlabs"
        except QuotaExceededError as e:
            logger.warning("ElevenLabs quota/auth issue — falling back to Edge TTS. Reason: %s", e)
        except httpx.HTTPStatusError as e:
            logger.warning("ElevenLabs HTTP error %s — falling back to Edge TTS.", e.response.status_code)
        except Exception as e:
            logger.warning("ElevenLabs unexpected error — falling back to Edge TTS: %s", e)

    # Fallback: Edge TTS (free, unlimited)
    logger.info("Using Edge TTS fallback (language=%s)", language)
    audio = await edge_tts_generate(text, language, speed_to_edge_rate(speed))
    return audio, "edge_tts"
