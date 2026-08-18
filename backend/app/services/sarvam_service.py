"""
Sarvam AI Service for EduVoice
Replaces Gemini AI + ElevenLabs with Sarvam's sovereign Indian AI infrastructure.

APIs covered:
  - Chat Completion  : sarvam-30b / sarvam-105b
  - TTS              : Bulbul v3
  - Translation      : Mayura
  - Document AI      : Digitise / Status / Download
  - Language Detection
"""

import logging
import httpx
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class SarvamService:
    def __init__(self):
        self.api_key = settings.sarvam_api_key
        self.base_url = "https://api.sarvam.ai"

        if not self.api_key:
            logger.warning(
                "SARVAM_API_KEY is not set. Sarvam endpoints will return errors."
            )

    # ── Internal helpers ────────────────────────────────────────────────────

    def _chat_headers(self) -> Dict[str, str]:
        """Headers for Chat Completion API (Bearer auth)."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _api_headers(self) -> Dict[str, str]:
        """Headers for all other Sarvam APIs (subscription-key auth)."""
        return {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json",
        }

    def _require_key(self):
        if not self.api_key:
            raise HTTPException(
                status_code=500,
                detail="SARVAM_API_KEY not configured in environment variables.",
            )

    # ── Chat Completion ─────────────────────────────────────────────────────

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "sarvam-30b",
        temperature: float = 0.7,
        max_tokens: int = 500,
    ) -> str:
        """
        Call the Sarvam Chat Completion API.

        Models: sarvam-30b | sarvam-105b | sarvam-105b-conversations
        Pricing: ₹2.5–4 / 1M tokens
        Docs: https://docs.sarvam.ai/api-reference/chat/chat-completions
        """
        self._require_key()
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/v1/chat/completions",
                headers=self._chat_headers(),
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )

        if response.status_code != 200:
            logger.error("Sarvam Chat API error %s: %s", response.status_code, response.text)
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Sarvam Chat API error: {response.text}",
            )

        data = response.json()
        # Standard OpenAI-compatible response shape
        return data["choices"][0]["message"]["content"]

    # ── Text-to-Speech ──────────────────────────────────────────────────────

    async def text_to_speech(
        self,
        text: str,
        language: str = "en-IN",
        voice_id: Optional[str] = None,
        model: str = "bulbul:v3",
    ) -> bytes:
        """
        Call the Sarvam TTS API (Bulbul v3).

        Supports 22+ Indian languages + English.
        Pricing: ₹30 / 10K chars
        Returns: Raw audio bytes (WAV/MP3 depending on API response)
        Docs: https://docs.sarvam.ai/api/migrations/from-elevenlabs/text-to-speech
        """
        self._require_key()
        payload: Dict[str, Any] = {
            "inputs": [text],
            "target_language_code": language,
            "model": model,
        }
        if voice_id:
            payload["speaker"] = voice_id

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/text-to-speech",
                headers=self._api_headers(),
                json=payload,
            )

        if response.status_code != 200:
            logger.error("Sarvam TTS error %s: %s", response.status_code, response.text)
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Sarvam TTS error: {response.text}",
            )

        # Sarvam TTS returns JSON with base64-encoded audios list
        data = response.json()
        if "audios" in data and data["audios"]:
            import base64
            return base64.b64decode(data["audios"][0])

        # If raw bytes returned directly
        return response.content

    # ── Translation ─────────────────────────────────────────────────────────

    async def translate(
        self,
        text: str,
        source_language: str,
        target_language: str,
        model: str = "mayura:v1",
    ) -> str:
        """
        Call the Sarvam Translation API (Mayura).

        Supports 22+ Indian languages.
        Pricing: ₹20 / 10K chars
        Docs: https://docs.sarvam.ai/api-reference/translate
        """
        self._require_key()
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/translate",
                headers=self._api_headers(),
                json={
                    "input": text,
                    "source_language_code": source_language,
                    "target_language_code": target_language,
                    "model": model,
                },
            )

        if response.status_code != 200:
            logger.error("Sarvam Translation error %s: %s", response.status_code, response.text)
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Sarvam Translation error: {response.text}",
            )

        data = response.json()
        return data.get("translated_text", "")

    # ── Document Intelligence ────────────────────────────────────────────────

    async def process_document(
        self,
        file_bytes: bytes,
        filename: str,
        language: str = "hi-IN",
        output_format: str = "md",
    ) -> Dict[str, Any]:
        """
        Submit a document to Sarvam Document Intelligence API.

        Supports: PDF, DOCX, PNG, JPG
        Pricing: ₹0.5 / page
        Returns: Job ID and initial status for polling.
        """
        self._require_key()
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/doc-ai/v1/job/digitise",
                headers={"api-subscription-key": self.api_key},
                files={"document": (filename, file_bytes, "application/pdf")},
                data={"language": language, "output_format": output_format},
            )

        if response.status_code != 200:
            logger.error("Sarvam Document AI error %s: %s", response.status_code, response.text)
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Sarvam Document AI error: {response.text}",
            )

        return response.json()

    async def get_document_status(self, job_id: str) -> Dict[str, Any]:
        """Poll the processing status of a previously submitted document job."""
        self._require_key()
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.base_url}/doc-ai/v1/job/{job_id}/status",
                headers={"api-subscription-key": self.api_key},
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Sarvam Document AI status error: {response.text}",
            )

        return response.json()

    async def get_document_output(self, job_id: str) -> bytes:
        """Download the processed document output (ZIP archive)."""
        self._require_key()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(
                f"{self.base_url}/doc-ai/v1/job/{job_id}/download",
                headers={"api-subscription-key": self.api_key},
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Sarvam Document AI download error: {response.text}",
            )

        return response.content

    # ── Language Detection ──────────────────────────────────────────────────

    async def detect_language(self, text: str) -> str:
        """Detect the language of the input text."""
        self._require_key()
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{self.base_url}/detect-language",
                headers=self._api_headers(),
                json={"input": text},
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Sarvam Language Detection error: {response.text}",
            )

        data = response.json()
        return data.get("language_code", "unknown")
