# Agentic AI Workflow

EduVoice AI utilizes a multi-agent system to handle complex educational tasks efficiently. Instead of a single, monolithic LLM prompt, we employ an Orchestrator Agent that routes tasks to Specialized Agents.

## Architecture Diagram

```mermaid
graph TD
    User([Teacher/User]) -->|Action + Payload| Frontend(React Frontend)
    Frontend -->|POST /process-content| Orchestrator(Orchestrator Agent)
    
    Orchestrator -->|Action: summarize| SumAgent(Summarization Agent)
    Orchestrator -->|Action: translate| TransAgent(Translation Agent)
    Orchestrator -->|Action: rewrite| SimpAgent(Simplification Agent)
    Orchestrator -->|Action: homework| HwAgent(Homework Agent)
    
    SumAgent --> LLM(Gemini 1.5 Flash)
    TransAgent --> LLM
    SimpAgent --> LLM
    HwAgent --> LLM
    
    LLM --> ResponseFormatter(Response Formatter)
    ResponseFormatter --> TTS(TTS Service)
    
    TTS -->|Primary| ElevenLabs(ElevenLabs API)
    ElevenLabs -- "Fallback 1" --> OpenRouter(OpenRouter TTS)
    OpenRouter -- "Fallback 2" --> EdgeTTS(Edge TTS)
    
    ElevenLabs --> Output(Audio + Text)
    OpenRouter --> Output
    EdgeTTS --> Output
    
    Output --> DB[(Supabase Storage)]
    Output --> User
```

## Agent Roles

1. **Orchestrator Agent (`backend/app/services/orchestrator.py`)**
   - The central decision-maker. Receives the requested action, validates the payload, and delegates to the appropriate specialized agent.
2. **Specialized Agents (`backend/app/services/gemini_service.py`)**
   - Each agent has a distinct, narrow focus and uses specific, optimized prompts loaded from the `prompts/` directory.
3. **TTS Service / Voice Agent (`backend/app/services/tts_service.py`)**
   - Handles the conversion of text to speech, actively managing fallback scenarios to ensure high reliability.
