# Computational Thinking in EduVoice AI

EduVoice AI leverages Computational Thinking (CT) principles to break down the complex problem of generating personalized, multilingual educational audio into manageable, scalable components.

## 1. Decomposition
We broke down the "AI Teacher Assistant" problem into specialized agents:
- **Summarization Agent:** Reduces long chapters into concise notes.
- **Translation Agent:** Localizes content for regional accessibility.
- **Simplification Agent:** Adjusts complexity based on grade level.
- **Generative Agents:** Handle specific tasks (homework, announcements, assembly).

## 2. Pattern Recognition
We identified common patterns in teacher workflows:
- Repetitive task generation (e.g., daily announcements).
- Standardized educational structures (e.g., revision notes).
These patterns allowed us to create specialized prompt templates rather than using a general-purpose chat interface.

## 3. Abstraction
- **Orchestrator Agent:** Abstracts away the complexity of routing requests. The frontend only calls `/process-content` with an action and payload; the Orchestrator handles the rest.
- **TTS Fallback Mechanism:** Abstracts the audio generation provider. If ElevenLabs fails (quota exceeded, error), it falls back to OpenRouter TTS, and if that fails, it cascades to Edge TTS.

## 4. Algorithm Design
Our core algorithm for content processing and audio generation:
1. Receive user input and desired `action`.
2. Orchestrator routes to the correct `Specialized Agent`.
3. Agent fetches the correct prompt template and injects variables.
4. Agent queries the LLM (Gemini 1.5 Flash via OpenRouter) and receives the response.
5. Content is sent to the `TTS Service`.
6. `TTS Service` attempts primary generation (ElevenLabs).
7. On failure, `TTS Service` attempts Fallback 1 (OpenRouter TTS).
8. On secondary failure, it triggers Fallback 2 (Edge TTS).
9. Resulting audio is validated, stored in Supabase, and returned to the user.
