"""
WebSocket Routes
Handles real-time streaming connections for Voice Agents
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
import json
from websocket_server.voice_pipeline import RealTimeVoicePipeline

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/voice-agent")
async def voice_agent_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time voice streaming
    Client sends audio bytes -> Server processes -> Server sends TTS bytes
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    pipeline = RealTimeVoicePipeline()
    
    # Create an async generator to yield audio/text chunks received from client
    async def audio_stream_generator():
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    json_data = json.loads(data)
                    yield json_data
                except:
                    yield data
        except WebSocketDisconnect:
            logger.info("Client disconnected from WebSocket")
            raise
    
    try:
        # Process the stream
        async for result in pipeline.process_voice_stream(audio_stream_generator()):
            if isinstance(result, bytes):
                await websocket.send_bytes(result)
            else:
                await websocket.send_json(result)
            
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected normally")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass
    finally:
        pipeline.is_active = False
