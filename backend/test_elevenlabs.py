import asyncio
import httpx
from app.config.settings import get_settings

settings = get_settings()

async def test_elevenlabs():
    print(f"Key: {settings.elevenlabs_api_key}")
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://api.elevenlabs.io/v1/voices",
            headers={"xi-api-key": settings.elevenlabs_api_key},
        )
        print(f"Status: {r.status_code}")
        print(f"Body: {r.text[:500]}")

if __name__ == "__main__":
    asyncio.run(test_elevenlabs())
