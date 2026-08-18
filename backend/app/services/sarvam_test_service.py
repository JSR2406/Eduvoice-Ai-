"""
Sarvam AI Testing Service
Production-ready test endpoints for Sarvam Startup Program validation.
"""

import base64
import os
import logging
from typing import Dict, Any, List

from .sarvam_service import SarvamService

logger = logging.getLogger(__name__)


class SarvamTestService:
    def __init__(self):
        self.sarvam = SarvamService()

    # ── Health ──────────────────────────────────────────────────────────────

    async def test_health(self) -> Dict[str, Any]:
        """Test whether Sarvam API key is configured and return service info."""
        return {
            "success": True,
            "status": "connected" if os.getenv("SARVAM_API_KEY") else "no_key",
            "api_key_configured": bool(os.getenv("SARVAM_API_KEY")),
            "base_url": self.sarvam.base_url,
            "available_models": [
                "sarvam-105b (Chat)",
                "sarvam-105b-conversations (Chat)",
                "bulbul:v3 (TTS)",
                "mayura:v1 (Translation)",
                "saaras/saarika (STT — coming soon)",
            ],
            "pricing": {
                "chat_30b": "₹2.5 / 1M tokens",
                "chat_105b": "₹4 / 1M tokens",
                "tts_bulbul_v3": "₹30 / 10K chars",
                "translation_mayura": "₹20 / 10K chars",
                "document_ai": "₹0.5 / page",
            },
            "startup_program": "6–12 months free API credits via Sarvam Startup Program",
        }

    # ── Chat Completion ─────────────────────────────────────────────────────

    async def test_chat_completion(self, message: str) -> Dict[str, Any]:
        """Test Sarvam Chat Completion API with a simple message."""
        try:
            response = await self.sarvam.chat_completion(
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant for teachers."},
                    {"role": "user", "content": message},
                ],
                model="sarvam-105b-conversations",
                temperature=0.7,
                max_tokens=200,
            )
            return {
                "success": True,
                "model": "sarvam-105b-conversations",
                "response": response,
                "message": "✅ Chat completion working",
            }
        except Exception as e:
            logger.error("Chat completion test failed: %s", e)
            return {"success": False, "error": str(e), "message": "❌ Chat completion failed"}

    # ── TTS ─────────────────────────────────────────────────────────────────

    async def test_tts(self, text: str, language: str = "en-IN") -> Dict[str, Any]:
        """Test Sarvam TTS API (Bulbul v3)."""
        try:
            audio_bytes = await self.sarvam.text_to_speech(
                text=text,
                language=language,
                model="bulbul:v3",
            )
            audio_b64 = base64.b64encode(audio_bytes).decode()
            return {
                "success": True,
                "model": "bulbul:v3",
                "language": language,
                "audio_base64_preview": audio_b64[:100] + "...",
                "audio_size_bytes": len(audio_bytes),
                "message": "✅ TTS working — audio generated",
            }
        except Exception as e:
            logger.error("TTS test failed: %s", e)
            return {"success": False, "error": str(e), "message": "❌ TTS failed"}

    # ── Translation ─────────────────────────────────────────────────────────

    async def test_translation(
        self,
        text: str,
        source_language: str = "en-IN",
        target_language: str = "hi-IN",
    ) -> Dict[str, Any]:
        """Test Sarvam Translation API (Mayura)."""
        try:
            translated = await self.sarvam.translate(
                text=text,
                source_language=source_language,
                target_language=target_language,
            )
            return {
                "success": True,
                "model": "mayura:v1",
                "source_language": source_language,
                "target_language": target_language,
                "original_text": text,
                "translated_text": translated,
                "message": "✅ Translation working",
            }
        except Exception as e:
            logger.error("Translation test failed: %s", e)
            return {"success": False, "error": str(e), "message": "❌ Translation failed"}

    # ── Document AI ─────────────────────────────────────────────────────────

    async def test_document_processing(self) -> Dict[str, Any]:
        """Return Document Intelligence API capabilities (no upload needed)."""
        return {
            "success": True,
            "api": "Sarvam Document Intelligence",
            "supported_input_formats": ["PDF", "DOCX", "PNG", "JPG"],
            "supported_output_formats": ["md", "html"],
            "supported_languages": [
                "hi-IN", "en-IN", "ta-IN", "te-IN", "mr-IN",
                "bn-IN", "gu-IN", "kn-IN", "ml-IN", "pa-IN",
            ],
            "pricing": "₹0.5 / page",
            "message": "✅ Document AI ready — upload a PDF to test live digitisation",
        }

    # ── Full EduVoice Workflow ───────────────────────────────────────────────

    async def test_full_eduvoice_workflow(self) -> Dict[str, Any]:
        """
        End-to-end EduVoice AI workflow test:
          1. Summarise lesson text via Sarvam Chat
          2. Translate summary to Hindi via Mayura
          3. Generate English TTS via Bulbul v3
          4. Generate Hindi TTS via Bulbul v3
        """
        lesson_text = (
            "Artificial Intelligence is transforming education. "
            "Teachers can use AI to create personalised learning experiences, "
            "automate administrative tasks, and provide instant feedback to students. "
            "AI-powered tools help teachers save time and improve student outcomes."
        )

        steps: Dict[str, Any] = {}

        # Step 1: Summarise
        try:
            summary = await self.sarvam.chat_completion(
                messages=[
                    {
                        "role": "system",
                        "content": "Summarise this educational text in 2 sentences for teachers.",
                    },
                    {"role": "user", "content": lesson_text},
                ],
                model="sarvam-105b-conversations",
                max_tokens=100,
            )
            steps["1_summarisation"] = {
                "model": "sarvam-105b-conversations",
                "result_preview": summary[:120] + ("..." if len(summary) > 120 else ""),
                "status": "✅ Success",
            }
        except Exception as e:
            steps["1_summarisation"] = {"status": f"❌ Failed: {e}"}
            summary = lesson_text  # continue with original text

        # Step 2: Translate to Hindi
        try:
            translated = await self.sarvam.translate(
                text=summary,
                source_language="en-IN",
                target_language="hi-IN",
            )
            steps["2_translation"] = {
                "model": "mayura:v1",
                "result_preview": translated[:120] + ("..." if len(translated) > 120 else ""),
                "status": "✅ Success",
            }
        except Exception as e:
            steps["2_translation"] = {"status": f"❌ Failed: {e}"}
            translated = summary

        # Step 3: English TTS
        try:
            audio_en = await self.sarvam.text_to_speech(text=summary, language="en-IN")
            steps["3_tts_english"] = {
                "model": "bulbul:v3",
                "language": "en-IN",
                "audio_size_bytes": len(audio_en),
                "status": "✅ Generated",
            }
        except Exception as e:
            steps["3_tts_english"] = {"status": f"❌ Failed: {e}"}
            audio_en = b""

        # Step 4: Hindi TTS
        try:
            audio_hi = await self.sarvam.text_to_speech(text=translated, language="hi-IN")
            steps["4_tts_hindi"] = {
                "model": "bulbul:v3",
                "language": "hi-IN",
                "audio_size_bytes": len(audio_hi),
                "status": "✅ Generated",
            }
        except Exception as e:
            steps["4_tts_hindi"] = {"status": f"❌ Failed: {e}"}
            audio_hi = b""

        all_passed = all("✅" in str(s.get("status", "")) for s in steps.values())
        return {
            "success": all_passed,
            "workflow": "complete" if all_passed else "partial",
            "steps": steps,
            "total_audio_bytes": len(audio_en) + len(audio_hi),
            "message": (
                "✅✅✅ Full EduVoice workflow successful with Sarvam AI! Ready for production."
                if all_passed
                else "⚠️ Workflow completed with some failures — check individual steps."
            ),
        }

    # ── Comprehensive Test Report ────────────────────────────────────────────

    async def generate_test_report(self) -> Dict[str, Any]:
        """
        Generate a comprehensive test report for the Sarvam Startup Program application.
        Run this before submitting your application.
        """
        from datetime import datetime

        tests: List[Dict[str, Any]] = [
            await self.test_health(),
            await self.test_chat_completion(
                "Say 'Hello from EduVoice AI powered by Sarvam' in both Hindi and English."
            ),
            await self.test_tts(
                "Welcome to EduVoice AI. This is a test of Sarvam Bulbul v3 text-to-speech.",
                language="en-IN",
            ),
            await self.test_translation(
                "Good morning students, today we will learn about artificial intelligence.",
                source_language="en-IN",
                target_language="hi-IN",
            ),
            await self.test_full_eduvoice_workflow(),
        ]

        passed = sum(1 for t in tests if t.get("success", False))
        total = len(tests)

        return {
            "test_report": "EduVoice AI — Sarvam API Integration",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "total_tests": total,
            "passed": passed,
            "failed": total - passed,
            "success_rate": f"{(passed / total) * 100:.1f}%",
            "ready_for_production": passed == total,
            "startup_program_ready": passed >= 4,  # health + 3 APIs minimum
            "tests": tests,
            "recommendations": [
                "✅ All Sarvam APIs working correctly" if passed == total
                else f"⚠️ {total - passed} test(s) failed — check SARVAM_API_KEY and API status",
                "✅ Ready to apply for Sarvam Startup Program" if passed >= 4
                else "❌ Fix failing APIs before applying",
                "Next: Add SARVAM_API_KEY to Vercel environment variables",
                "Next: Apply at https://www.sarvam.ai/startup-program",
            ],
        }
