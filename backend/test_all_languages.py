import asyncio
import sys
import os

# Add the current directory to python path so 'app' can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.sarvam_tts_service import generate_speech, SARVAM_LANG_MAP

# Sample short text for each language
TEST_TEXTS = {
    "en": "Hello, how are you?",
    "hi": "नमस्ते, आप कैसे हैं?",
    "mr": "नमस्कार, तुम्ही कसे आहात?",
    "gu": "નમસ્તે, તમે કેમ છો?",
    "ta": "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?",
    "te": "నమస్కారం, మీరు ఎలా ఉన్నారు?",
    "bn": "নমস্কার, আপনি কেমন আছেন?",
    "kn": "ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ?",
    "ml": "നമസ്കാരം, സുഖമാണോ?",
    "pa": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?",
    "or": "ନମସ୍କାର, ଆପଣ କେମିତି ଅଛନ୍ତି?",
}

async def run_test():
    print("====================================================")
    print("AUTOMATED AUDIO TEST - SARVAM TTS (ALL LANGUAGES)")
    print("====================================================")
    
    success_count = 0
    fail_count = 0

    for lang, lang_code in SARVAM_LANG_MAP.items():
        text = TEST_TEXTS.get(lang, "Hello")
        print(f"Testing language: {lang} ({lang_code}) - Input: {text}")
        try:
            audio_bytes, provider = await generate_speech(text=text, language=lang, voice_id="ritu")
            if audio_bytes and len(audio_bytes) > 0:
                print(f"  SUCCESS: Generated {len(audio_bytes)} bytes using provider '{provider}'")
                
                # Verify that it is not too small
                size_kb = len(audio_bytes) / 1024
                if size_kb < 2:
                    print(f"  WARNING: Audio file seems too small: {size_kb:.2f} KB")
                
                output_file = f"test_audio_{lang}.mp3"
                with open(output_file, "wb") as f:
                    f.write(audio_bytes)
                success_count += 1
            else:
                print(f"  ERROR: Received empty audio data for {lang}")
                fail_count += 1
        except Exception as e:
            print(f"  ERROR: Failed for {lang}: {e}")
            fail_count += 1
            
    print("\n====================================================")
    print(f"TEST SUMMARY: {success_count} successful, {fail_count} failed.")
    print("====================================================")
    
    if fail_count > 0:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_test())
