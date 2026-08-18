import pytest
from unittest.mock import patch, AsyncMock
from app.services.tts_service import generate_speech, get_voices

@pytest.mark.asyncio
async def test_get_voices():
    voices = await get_voices()
    assert isinstance(voices, list)
    assert len(voices) > 0

@pytest.mark.asyncio
async def test_generate_speech_fallback():
    # Test fallback by patching elevenlabs and openrouter to fail
    with patch('app.services.tts_service.elevenlabs_tts', side_effect=Exception("ElevenLabs API Error")):
        with patch('app.services.tts_service.openrouter_tts', side_effect=Exception("OpenRouter API Error")):
            # Mock edge_tts success
            with patch('app.services.tts_service.edge_tts_generate', new_callable=AsyncMock) as mock_edge:
                mock_edge.return_value = b"audio data"
                audio, provider = await generate_speech("Hello", "voice123")
                
                assert audio == b"audio data"
                assert provider == "edge_tts"
                mock_edge.assert_called_once()
