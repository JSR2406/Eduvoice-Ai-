# API Documentation

## System Endpoints

### `GET /api/health`
Health check endpoint.
- **Response:** `{"status": "ok", "message": "EduVoice AI Backend is running"}`

### `GET /api/agents`
Lists available specialized agents.
- **Response:** `{"orchestrator": "...", "specialized_agents": ["summarize", "translate", ...], "status": "ready"}`

## Content Generation (Agentic)

### `POST /api/process-content`
Routes a task to the appropriate specialized agent via the Orchestrator.

**Payload Example:**
```json
{
  "action": "rewrite",
  "payload": {
    "text": "The mitochondria is the powerhouse of the cell.",
    "grade": "2nd Grade"
  }
}
```

**Response Example:**
```json
{
  "agent_used": "rewrite",
  "result": "The mitochondria gives the cell energy, like a battery!",
  "status": "success",
  "error": null
}
```

## Audio Generation

### `POST /api/generate-audio`
Converts text to speech using ElevenLabs (with cascading fallbacks to OpenRouter and Edge TTS).

**Payload:**
```json
{
  "text": "Hello students!",
  "voice_id": "alloy",
  "language": "en",
  "save_to_history": true,
  "user_id": "uuid-here"
}
```
- **Response:** `audio/mpeg` binary stream.

## History & Templates

- `GET /api/history`
- `PATCH /api/history/{item_id}`
- `DELETE /api/history/{item_id}`
- `GET /api/templates`
- `POST /api/templates`
- `PATCH /api/templates/{item_id}`
- `DELETE /api/templates/{item_id}`
