import pytest
from unittest.mock import patch, AsyncMock
from app.services.gemini_service import summarize, translate, rewrite_for_grade

@pytest.mark.asyncio
async def test_summarize():
    with patch('app.services.gemini_service._ask', new_callable=AsyncMock) as mock_ask:
        mock_ask.return_value = "This is a summary."
        result = await summarize("Long text here.")
        assert result == "This is a summary."
        mock_ask.assert_called_once()

@pytest.mark.asyncio
async def test_translate():
    with patch('app.services.gemini_service._ask', new_callable=AsyncMock) as mock_ask:
        mock_ask.return_value = "नमस्ते"
        result = await translate("Hello", "hi")
        assert result == "नमस्ते"
        mock_ask.assert_called_once()

@pytest.mark.asyncio
async def test_rewrite_for_grade():
    with patch('app.services.gemini_service._ask', new_callable=AsyncMock) as mock_ask:
        mock_ask.return_value = "Rewritten for 2nd grade."
        result = await rewrite_for_grade("Complex text", "2nd Grade")
        assert result == "Rewritten for 2nd grade."
        mock_ask.assert_called_once()
