"""
Voice Content Agent
Generates AI voice content using Sarvam TTS
"""

from typing import Dict, Any
from datetime import datetime
from .base_agent import BaseAgent
from ..services.sarvam_tts_service import generate_speech
from ..services.sarvam_service import SarvamService
import logging
import base64

logger = logging.getLogger(__name__)

class VoiceContentAgent(BaseAgent):
    """
    Agent responsible for generating AI voice content
    - Text-to-Speech (TTS)
    - Translation + TTS
    """
    
    def __init__(self):
        super().__init__(
            agent_name="VoiceContentAgent",
            agent_type="voice_generation"
        )
        self.sarvam = SarvamService()
    
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute voice generation task
        """
        start_time = datetime.now()
        
        try:
            # Validate input
            if not await self.validate_input(task):
                return {"success": False, "error": "Invalid input", "latency_ms": 0}
            
            action = task.get("action")
            text = task.get("text", "")
            language = task.get("language", "en")
            voice_id = task.get("voice_id", "ritu")
            
            # Route to appropriate handler
            if action == "generate_tts":
                result = await self._generate_tts(text, language, voice_id)
            elif action == "translate_and_tts":
                result = await self._translate_and_tts(
                    text,
                    task.get("source_language", "en"),
                    language,
                    voice_id
                )
            else:
                result = {"success": False, "error": f"Unknown action: {action}"}
            
            # Add latency
            end_time = datetime.now()
            latency_ms = (end_time - start_time).total_seconds() * 1000
            result["latency_ms"] = latency_ms
            
            # Log execution
            await self.log_execution(task, result)
            
            return result
        
        except Exception as e:
            logger.error(f"VoiceContentAgent error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "latency_ms": 0
            }
    
    async def _generate_tts(self, text: str, language: str, voice_id: str = None) -> Dict[str, Any]:
        """Generate TTS audio from text"""
        try:
            audio_bytes, provider = await generate_speech(
                text=text,
                language=language,
                voice_id=voice_id
            )
            
            # Convert to base64 for API response
            audio_base64 = base64.b64encode(audio_bytes).decode()
            
            return {
                "success": True,
                "audio_base64": audio_base64,
                "audio_size_bytes": len(audio_bytes),
                "language": language,
                "voice_id": voice_id or "default",
                "provider": provider,
                "message": "TTS generated successfully"
            }
        
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _translate_and_tts(self, text: str, source_lang: str, target_lang: str, voice_id: str = None) -> Dict[str, Any]:
        """Translate text and generate TTS"""
        try:
            s_lang = source_lang if "-" in source_lang else f"{source_lang}-IN"
            t_lang = target_lang if "-" in target_lang else f"{target_lang}-IN"
            
            # Step 1: Translate
            translated_text = await self.sarvam.translate(
                text=text,
                source_language=s_lang,
                target_language=t_lang
            )
            
            # Step 2: Generate TTS
            audio_bytes, provider = await generate_speech(
                text=translated_text,
                language=target_lang,
                voice_id=voice_id
            )
            
            audio_base64 = base64.b64encode(audio_bytes).decode()
            
            return {
                "success": True,
                "original_text": text,
                "translated_text": translated_text,
                "audio_base64": audio_base64,
                "audio_size_bytes": len(audio_bytes),
                "source_language": source_lang,
                "target_language": target_lang,
                "provider": provider,
                "message": "Translation + TTS completed"
            }
        
        except Exception as e:
            return {"success": False, "error": str(e)}
