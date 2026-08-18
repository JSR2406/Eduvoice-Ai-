# EduVoice AI — Sarvam AI Migration Guide

## Why Migrate to Sarvam?

| Reason | Detail |
|--------|--------|
| 🇮🇳 Sovereign Indian AI | Built for India, trained on Indian data |
| 🗣️ 22+ Indian Languages | Native Hindi, Tamil, Telugu, Marathi, Gujarati… |
| 💰 Cost Advantage | 6–12 months free API credits via Startup Program |
| ⚡ Lower Latency | India-based servers, 200–400ms vs 500–800ms |
| 🏛️ Government Backed | Selected under IndiaAI Mission |

---

## API Comparison

### TTS: ElevenLabs → Sarvam Bulbul v3

| Feature | ElevenLabs | Sarvam Bulbul v3 |
|---------|-----------|-----------------|
| Indian languages | Limited | 22+ native ✅ |
| Hinglish / code-mixed | No | Yes ✅ |
| Pricing | $0.30 / 1K chars | ₹30 / 10K chars (~$0.036) ✅ |
| India server latency | 500–800 ms | 200–400 ms ✅ |
| Startup free credits | No | 6–12 months ✅ |

### LLM: Gemini (via OpenRouter) → Sarvam-30B / 105B

| Feature | Gemini 1.5 Flash | Sarvam-30B |
|---------|-----------------|-----------|
| Indian language quality | Good | Excellent ✅ |
| Pricing | ~$0.075 / 1M tokens | ₹2.5 / 1M (~$0.03) ✅ |
| Startup free credits | No | 6–12 months ✅ |
| Data sovereignty | US-based | India-based ✅ |

---

## Migration Steps

### Step 1: Get Your Sarvam API Key

1. Sign up at <https://dashboard.sarvam.ai>
2. Navigate to **Key Management**
3. Copy your API key
4. Add to `backend/.env`:
   ```
   SARVAM_API_KEY=your_key_here
   ```

### Step 2: Test the Integration

```bash
# Start backend
cd backend
uvicorn main:app --reload

# Verify key is recognised
curl http://localhost:8000/api/sarvam-test/health

# Run full workflow test
curl http://localhost:8000/api/sarvam-test/test-full-workflow

# Generate startup program test report
curl http://localhost:8000/api/sarvam-test/test-report
```

### Step 3: Deploy to Vercel

Add these environment variables in the Vercel dashboard:

```
SARVAM_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_key
```

Then redeploy:
```bash
vercel --prod
```

### Step 4: Apply to Sarvam Startup Program

1. Visit <https://www.sarvam.ai/startup-program>
2. Fill in the application form — see `STARTUP_APPLICATION_CHECKLIST.md`
3. Include your test report (100% pass rate expected)

---

## Available Sarvam Test Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sarvam-test/health` | API key check + model list |
| POST | `/api/sarvam-test/test-chat` | Chat Completion (sarvam-30b) |
| POST | `/api/sarvam-test/test-tts` | TTS (Bulbul v3) |
| POST | `/api/sarvam-test/test-translation` | Translation (Mayura) |
| GET | `/api/sarvam-test/test-document` | Document AI capabilities |
| GET | `/api/sarvam-test/test-full-workflow` | End-to-end pipeline |
| GET | `/api/sarvam-test/test-report` | Full test report |

---

## Expected Monthly Costs (Post Free-Credits Period)

| API | Volume / Month | Cost |
|-----|---------------|------|
| Chat (sarvam-30b) | 1M tokens | ₹2.50 |
| TTS (Bulbul v3) | 100K chars | ₹300 |
| Translation (Mayura) | 50K chars | ₹100 |
| **Total** | | **~₹402 (~$4.80)** |

> **With Startup Program:** ₹0 for 6–12 months 🎉

---

## Supported Languages

| Code | Language | TTS | Chat | Translation |
|------|----------|-----|------|-------------|
| `en-IN` | English (India) | ✅ | ✅ | ✅ |
| `hi-IN` | Hindi | ✅ | ✅ | ✅ |
| `ta-IN` | Tamil | ✅ | ✅ | ✅ |
| `te-IN` | Telugu | ✅ | ✅ | ✅ |
| `mr-IN` | Marathi | ✅ | ✅ | ✅ |
| `bn-IN` | Bengali | ✅ | ✅ | ✅ |
| `gu-IN` | Gujarati | ✅ | ✅ | ✅ |
| `kn-IN` | Kannada | ✅ | ✅ | ✅ |
| `ml-IN` | Malayalam | ✅ | ✅ | ✅ |
| `pa-IN` | Punjabi | ✅ | ✅ | ✅ |

---

## Troubleshooting

### "SARVAM_API_KEY not configured"
- Verify `.env` contains `SARVAM_API_KEY`
- Restart the backend server (`uvicorn main:app --reload`)
- Check the key at <https://dashboard.sarvam.ai/key-management>

### "401 Unauthorized"
- API key has expired or is invalid — regenerate at the dashboard

### "429 Rate Limit Exceeded"
- Starter tier: 60 req/min
- Pro tier: 200 req/min
- Apply for the Startup Program to get higher limits

### TTS returns empty audio
- Ensure `target_language_code` uses BCP-47 format: `en-IN`, not `en`
- Maximum input length per request: ~500 chars (split longer texts)

---

## Resources

- API Docs: <https://docs.sarvam.ai>
- Dashboard: <https://dashboard.sarvam.ai>
- Startup Program: <https://www.sarvam.ai/startup-program>
- Pricing: <https://docs.sarvam.ai/api/pricing>
- Migration (ElevenLabs → Bulbul): <https://docs.sarvam.ai/api/migrations/from-elevenlabs/text-to-speech>
