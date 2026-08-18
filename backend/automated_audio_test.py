import asyncio
import httpx
import os
import sys

async def run_test():
    print("====================================================")
    print("AUTOMATED AUDIO TEST - ELEVENLABS")
    print("====================================================")
    
    # 1. Verify API Key is loaded
    from app.config.settings import get_settings
    settings = get_settings()
    api_key = settings.elevenlabs_api_key
    
    if not api_key:
        print("ERROR: ElevenLabs API key is missing from environment variables.")
        sys.exit(1)
    
    print(f"SUCCESS: ElevenLabs API key is loaded ({api_key[:5]}...{api_key[-5:]})")
    
    # 2. Verify selected Voice ID is valid
    voice_id = "21m00Tcm4TlvDq8ikWAM" # Rachel
    print(f"SUCCESS: Voice ID selected: {voice_id}")
    
    # 3. Verify text is successfully sent to ElevenLabs Text-to-Speech endpoint
    text = "Good morning students. Welcome to today's class. Please open Chapter 3 and revise the concepts we learned yesterday."
    
    print("Sending request to ElevenLabs...")
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": api_key,
                "Content-Type": "application/json", 
                "Accept": "audio/mpeg",
            },
            json={
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "speed": 1.0,
                }
            }
        )
        
        # 4. Verify HTTP response status is 200
        if r.status_code != 200:
            print(f"ERROR: ElevenLabs API call failed with status {r.status_code}")
            print(f"Error details: {r.text}")
            sys.exit(1)
            
        print("SUCCESS: HTTP response status is 200")
        
        # 5. Verify API returns valid audio data
        if r.headers.get("content-type") != "audio/mpeg":
            print(f"ERROR: Expected audio/mpeg, got {r.headers.get('content-type')}")
            sys.exit(1)
            
        audio_data = r.content
        if not audio_data:
            print("ERROR: Received empty audio data")
            sys.exit(1)
            
        print("SUCCESS: Audio data is received")
        
        # 6. Audio file is larger than 10 KB
        size_kb = len(audio_data) / 1024
        if size_kb < 10:
            print(f"ERROR: Audio file is too small: {size_kb:.2f} KB")
            sys.exit(1)
            
        print(f"SUCCESS: Audio file is larger than 10 KB ({size_kb:.2f} KB)")
        
        # Save the audio
        output_file = "test_output.mp3"
        with open(output_file, "wb") as f:
            f.write(audio_data)
            
        print(f"SUCCESS: Audio file saved to {output_file}")
        
    print("\nAll validations passed! The audio generation is working perfectly.")

if __name__ == "__main__":
    asyncio.run(run_test())
