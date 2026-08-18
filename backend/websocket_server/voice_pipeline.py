"""
Real-Time Voice Pipeline
STT -> LLM -> TTS streaming pipeline with sub-500ms latency
"""

import asyncio
import logging
from typing import AsyncGenerator, Dict, Any
from datetime import datetime

# Import SarvamService from our backend structure
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.sarvam_service import SarvamService
from app.services.sarvam_tts_service import generate_speech

logger = logging.getLogger(__name__)

class RealTimeVoicePipeline:
    """
    Streaming voice pipeline for real-time voice agents
    Target latency: <500ms end-to-end
    """
    
    def __init__(self):
        self.sarvam = SarvamService()
        self.is_active = False
    
    async def process_voice_stream(
        self,
        audio_stream: AsyncGenerator[bytes, None]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Process real-time audio stream.
        This is a mock for real streaming implementation since streaming via websockets 
        would require full native stream support.
        Yields partial transcripts, final transcripts, TTS audio chunks.
        """
        self.is_active = True
        start_time = datetime.now()
        
        try:
            logger.info("Voice pipeline initialized")
            
            # Since Sarvam STT streaming might require specific websocket integration
            # We provide a mock structure for the streaming architecture
            
            async for chunk in audio_stream:
                if not self.is_active:
                    break
                
                # Assume chunk is a dictionary: {"type": "text", "text": "hello"}
                if isinstance(chunk, dict) and chunk.get("type") == "text":
                    user_text = chunk.get("text", "")
                    
                    yield {"type": "status", "status": "processing"}
                    
                    # 1. Call LLM
                    messages = [
                        {"role": "system", "content": "You are a helpful, brief AI teaching assistant. Keep responses under 2 sentences."},
                        {"role": "user", "content": user_text}
                    ]
                    llm_text = await self.sarvam.chat_completion(messages=messages, max_tokens=150)
                    
                    # 2. Yield LLM text back to user
                    yield {"type": "text", "text": llm_text}
                    
                    # 3. Call TTS
                    yield {"type": "status", "status": "speaking"}
                    audio_bytes = await self.sarvam.text_to_speech(text=llm_text, language="en-IN", voice_id="ritu")
                    
                    # 4. Yield audio bytes
                    if audio_bytes:
                        yield audio_bytes
                    
                    yield {"type": "status", "status": "idle"}
                    
        except Exception as e:
            logger.error(f"Voice pipeline error: {str(e)}")
            yield {"type": "error", "error": str(e)}
        finally:
            self.is_active = False
            logger.info("Voice pipeline closed")
