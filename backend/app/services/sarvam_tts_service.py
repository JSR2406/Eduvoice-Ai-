"""
Sarvam TTS Service — 4-tier cascading fallback pipeline.

Provider priority:
  1. Sarvam Bulbul v3  (primary  — 22+ Indian languages, sovereign AI)
  2. ElevenLabs        (fallback 1 — high quality, uses API key)
  3. OpenRouter TTS    (fallback 2 — uses API key)
  4. Edge TTS          (fallback 3 — Microsoft, free & unlimited)

This module maintains the same public interface as the legacy tts_service.py
so existing api_router.py routes work without modification.
"""

import logging
import os
import tempfile

import edge_tts
import httpx

from app.config.settings import get_settings
from app.services.sarvam_service import SarvamService

logger = logging.getLogger(__name__)
settings = get_settings()

ELEVENLABS_BASE = "https://api.elevenlabs.io/v1"
OPENROUTER_BASE = "https://openrouter.ai/api/v1"

# ── Language → Sarvam BCP-47 code map ───────────────────────────────────────
SARVAM_LANG_MAP: dict[str, str] = {
    "en": "en-IN",
    "hi": "hi-IN",
    "mr": "mr-IN",
    "gu": "gu-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "bn": "bn-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "pa": "pa-IN",
    "or": "od-IN",
}

# ── Language → Edge TTS Neural voice map ─────────────────────────────────────
EDGE_VOICE_MAP: dict[str, str] = {
    "en": "en-IN-NeerjaNeural",
    "hi": "hi-IN-SwaraNeural",
    "mr": "mr-IN-AarohiNeural",
    "gu": "gu-IN-DhwaniNeural",
    "ta": "ta-IN-PallaviNeural",
    "te": "te-IN-ShrutiNeural",
    "bn": "bn-IN-TanishaaNeural",
    "kn": "kn-IN-SapnaNeural",
    "ml": "ml-IN-SobhanaNeural",
}
DEFAULT_EDGE_VOICE = "en-IN-NeerjaNeural"

# ── Sarvam voice presets (Bulbul v3 speakers) ────────────────────────────────
SARVAM_VOICES = [
    {"voice_id": "ritu",     "name": "Ritu (Female, Casual)",     "provider": "sarvam"},
    {"voice_id": "aditya",   "name": "Aditya (Male, Warm)",       "provider": "sarvam"},
    {"voice_id": "priya",    "name": "Priya (Female, Clear)",     "provider": "sarvam"},
    {"voice_id": "rahul",    "name": "Rahul (Male, Formal)",      "provider": "sarvam"},
    {"voice_id": "neha",     "name": "Neha (Female, Neutral)",    "provider": "sarvam"},
    {"voice_id": "ashutosh", "name": "Ashutosh (Male, Deep)",     "provider": "sarvam"},
]

_SARVAM_VOICE_IDS = {v["voice_id"] for v in SARVAM_VOICES}


class QuotaExceededError(Exception):
    """Raised when an API quota or auth token is exhausted."""


# ─────────────────────────────────────────────────────────────────────────────
# Internal provider helpers
# ─────────────────────────────────────────────────────────────────────────────

# ── Edge TTS (always free) ───────────────────────────────────────────────────

def _speed_to_edge_rate(speed: float) -> str:
    pct = round((speed - 1.0) * 100)
    return f"{pct:+d}%"


async def _edge_tts_generate(text: str, language: str = "en", rate: str = "+0%") -> bytes:
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


# ── ElevenLabs (fallback 1) ──────────────────────────────────────────────────

async def _elevenlabs_get_voices() -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            f"{ELEVENLABS_BASE}/voices",
            headers={"xi-api-key": settings.elevenlabs_api_key},
        )
    r.raise_for_status()
    return [
        {"voice_id": v["voice_id"], "name": v["name"], "provider": "elevenlabs"}
        for v in r.json().get("voices", [])
    ]


async def _elevenlabs_tts(
    text: str,
    voice_id: str,
    stability: float = 0.5,
    similarity_boost: float = 0.75,
    speed: float = 1.0,
) -> bytes:
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity_boost,
            "speed": speed,
        },
    }
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(
            f"{ELEVENLABS_BASE}/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": settings.elevenlabs_api_key,
                "Content-Type": "application/json",
            },
            json=payload,
        )
    if r.status_code in (401, 402, 429, 422):
        raise QuotaExceededError(f"ElevenLabs error {r.status_code}")
    r.raise_for_status()
    return r.content


# ── OpenRouter TTS (fallback 2) ──────────────────────────────────────────────

async def _openrouter_tts(text: str, voice_id: str, speed: float = 1.0) -> bytes:
    valid_voices = {"alloy", "echo", "fable", "onyx", "nova", "shimmer"}
    voice = voice_id if voice_id in valid_voices else "alloy"
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(
            f"{OPENROUTER_BASE}/audio/speech",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "EduVoice AI",
            },
            json={
                "model": "openai/tts-1",
                "input": text,
                "voice": voice,
                "response_format": "mp3",
                "speed": speed,
            },
        )
    if r.status_code in (401, 402, 429):
        raise QuotaExceededError(f"OpenRouter error {r.status_code}")
    r.raise_for_status()
    return r.content


# ─────────────────────────────────────────────────────────────────────────────
# Public API  (drop-in replacement for legacy tts_service.py)
# ─────────────────────────────────────────────────────────────────────────────

async def get_voices() -> list[dict]:
    """
    Return available voices ordered by provider priority:
      Sarvam presets → ElevenLabs (if key set) → Edge TTS free fallbacks
    """
    voices: list[dict] = list(SARVAM_VOICES)

    if settings.elevenlabs_api_key:
        try:
            voices.extend(await _elevenlabs_get_voices())
        except Exception as e:
            logger.warning("ElevenLabs voice fetch failed: %s", e)

    voices += [
        {"voice_id": f"edge:{lang}", "name": label, "provider": "edge"}
        for lang, label in {
            "en": "Neerja (English India) — Free Fallback",
            "hi": "Swara (Hindi) — Free Fallback",
        }.items()
    ]
    return voices


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
    Generate speech using 4-tier cascading fallback.

    Priority:
      1. Sarvam Bulbul v3  — primary (sovereign Indian AI, 22+ languages)
      2. ElevenLabs        — fallback 1 (high quality)
      3. OpenRouter TTS    — fallback 2
      4. Edge TTS          — fallback 3 (always works, free)

    Returns: (audio_bytes, provider_name)
    """

    # Direct Edge TTS request (e.g. voice_id="edge:hi")
    if voice_id.startswith("edge:"):
        lang = voice_id.split(":", 1)[1]
        audio = await _edge_tts_generate(text, lang, _speed_to_edge_rate(speed))
        return audio, "edge_tts"

    # ── 1. Sarvam Bulbul v3 (primary) ───────────────────────────────────────
    if settings.sarvam_api_key:
        try:
            sarvam = SarvamService()
            sarvam_lang = SARVAM_LANG_MAP.get(language, "en-IN")
            # Only pass voice_id as Sarvam speaker if it's a known Bulbul preset
            speaker = voice_id if voice_id in _SARVAM_VOICE_IDS else None
            audio = await sarvam.text_to_speech(
                text=text,
                language=sarvam_lang,
                voice_id=speaker,
                model="bulbul:v3",
            )
            return audio, "sarvam_bulbul_v3"
        except Exception as e:
            logger.warning("Sarvam TTS failed (%s) — trying ElevenLabs", e)

    # ── 2. ElevenLabs (fallback 1) ───────────────────────────────────────────
    if settings.elevenlabs_api_key and voice_id:
        try:
            audio = await _elevenlabs_tts(text, voice_id, stability, similarity_boost, speed)
            return audio, "elevenlabs"
        except Exception as e:
            logger.warning("ElevenLabs failed (%s) — trying OpenRouter TTS", e)

    # ── 3. OpenRouter TTS (fallback 2) ──────────────────────────────────────
    if settings.openrouter_api_key:
        try:
            audio = await _openrouter_tts(text, voice_id, speed)
            return audio, "openrouter"
        except Exception as e:
            logger.warning("OpenRouter TTS failed (%s) — falling back to Edge TTS", e)

    # ── 4. Edge TTS (fallback 3 — always available, free) ───────────────────
    audio = await _edge_tts_generate(text, language, _speed_to_edge_rate(speed))
    return audio, "edge_tts"
