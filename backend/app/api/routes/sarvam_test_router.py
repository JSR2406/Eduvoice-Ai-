"""
Sarvam AI Testing Routes
Production-ready endpoints for validating the Sarvam integration.
Use /api/sarvam-test/test-report before applying to the Sarvam Startup Program.
"""

from fastapi import APIRouter, Query
from app.services.sarvam_test_service import SarvamTestService

router = APIRouter(prefix="/api/sarvam-test", tags=["Sarvam API Testing"])


def _svc() -> SarvamTestService:
    return SarvamTestService()


# ── Health ───────────────────────────────────────────────────────────────────

@router.get("/health", summary="Sarvam API health check")
async def sarvam_health():
    """
    Verify that the SARVAM_API_KEY is configured and return available
    models and pricing information.
    """
    return await _svc().test_health()


# ── Chat Completion ──────────────────────────────────────────────────────────

@router.post("/test-chat", summary="Test Sarvam Chat Completion (sarvam-30b)")
async def test_chat(
    message: str = Query(
        default="Say 'Hello, this is a test of Sarvam AI' in Hindi and English",
        description="Message to send to the Sarvam Chat API",
    )
):
    """Test the Sarvam Chat Completion API and return the model response."""
    return await _svc().test_chat_completion(message)


# ── TTS ──────────────────────────────────────────────────────────────────────

@router.post("/test-tts", summary="Test Sarvam TTS (Bulbul v3)")
async def test_tts(
    text: str = Query(
        default="Welcome to EduVoice AI. This is a test of Sarvam Bulbul text-to-speech.",
        description="Text to convert to speech",
    ),
    language: str = Query(default="en-IN", description="BCP-47 language code (e.g. en-IN, hi-IN)"),
):
    """Test Sarvam Bulbul v3 TTS API. Returns audio metadata on success."""
    return await _svc().test_tts(text, language)


# ── Translation ──────────────────────────────────────────────────────────────

@router.post("/test-translation", summary="Test Sarvam Translation (Mayura)")
async def test_translation(
    text: str = Query(
        default="Good morning students, today we will learn about artificial intelligence.",
        description="Text to translate",
    ),
    source_language: str = Query(default="en-IN", description="Source language code"),
    target_language: str = Query(default="hi-IN", description="Target language code"),
):
    """Test Sarvam Mayura translation API."""
    return await _svc().test_translation(text, source_language, target_language)


# ── Document AI ──────────────────────────────────────────────────────────────

@router.get("/test-document", summary="Sarvam Document Intelligence capabilities")
async def test_document():
    """Return Document Intelligence API capabilities and supported formats."""
    return await _svc().test_document_processing()


# ── Full Workflow ────────────────────────────────────────────────────────────

@router.get("/test-full-workflow", summary="End-to-end EduVoice AI workflow test")
async def test_full_workflow():
    """
    Run the complete EduVoice AI pipeline:
      1. Summarise text → Sarvam-30B
      2. Translate to Hindi → Mayura
      3. English TTS → Bulbul v3
      4. Hindi TTS → Bulbul v3
    """
    return await _svc().test_full_eduvoice_workflow()


# ── Test Report ──────────────────────────────────────────────────────────────

@router.get("/test-report", summary="Comprehensive Sarvam integration test report")
async def test_report():
    """
    Generate a comprehensive test report across all Sarvam API integrations.
    Run this before applying to the Sarvam Startup Program to confirm
    100% pass rate.
    """
    return await _svc().generate_test_report()
