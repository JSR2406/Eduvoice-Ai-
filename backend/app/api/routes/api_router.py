import io
import uuid
import time
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import Response, JSONResponse
from pypdf import PdfReader

from app.schemas.requests import (
    GenerateAudioRequest,
    SummarizeRequest, TranslateRequest, RewriteRequest,
    HomeworkRequest, AnnouncementRequest, RevisionRequest,
    ReadingRequest, AssemblyRequest,
    LessonRequest, StoryRequest, QuizRequest, DebateRequest,
    HistoryUpdateRequest, TemplateCreateRequest, TemplateUpdateRequest,
    ChatRequest
)
from pydantic import BaseModel
from typing import Dict, Any
from app.services import sarvam_tts_service as tts_service  # Sarvam-primary 4-tier TTS
from app.services import gemini_service
from app.services.orchestrator import orchestrator_agent, OrchestratorResponse
from app.database.supabase_client import get_db

class ProcessContentRequest(BaseModel):
    action: str
    payload: Dict[str, Any]

router = APIRouter()
db = get_db()


# ── System Routes ───────────────────────────────────────────────────────────

@router.get("/health")
async def health_check():
    return {"status": "ok", "message": "EduVoice AI Backend is running"}

@router.get("/agents")
async def list_agents():
    return {
        "orchestrator": "Routes tasks to specialized agents",
        "specialized_agents": list(orchestrator_agent.agents.keys()),
        "status": "ready"
    }

@router.post("/process-content", response_model=OrchestratorResponse)
async def process_content(req: ProcessContentRequest):
    return await orchestrator_agent.process_content(req.action, req.payload)

# ── TTS Routes ──────────────────────────────────────────────────────────────

@router.get("/voices")
async def get_voices():
    try:
        voices = await tts_service.get_voices()
        return {"voices": voices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-audio")
async def generate_audio(req: GenerateAudioRequest):
    try:
        start_time = time.time()
        
        # 1. Generate audio (uses fallback internally if needed)
        audio_bytes, provider = await tts_service.generate_speech(
            text=req.text,
            voice_id=req.voice_id,
            language=req.language,
            emotion=req.emotion,
            speed=req.speed,
            stability=req.stability,
            similarity_boost=req.similarity_boost,
        )
        
        duration_secs = int(time.time() - start_time)  # Rough estimate, better to get from audio length but this works for demo
        
        # 2. Save to history (if requested and user provided)
        if req.save_to_history and req.user_id:
            try:
                # Upload to Supabase Storage
                filename = f"audio_{uuid.uuid4().hex}.mp3"
                path = f"{req.user_id}/{filename}"
                
                # Use public bucket 'audio_files'
                db.storage.from_("audio_files").upload(path, audio_bytes, {"content-type": "audio/mpeg"})
                audio_url = db.storage.from_("audio_files").get_public_url(path)
                
                # Insert into history table
                db.table("audio_history").insert({
                    "user_id": req.user_id,
                    "title": req.title or "Untitled Audio",
                    "text_content": req.text,
                    "audio_url": audio_url,
                    "voice_id": req.voice_id,
                    "language": req.language,
                    "provider": provider,
                    "duration_secs": duration_secs,
                }).execute()
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Supabase history saving failed: {e}")
                # We continue since audio generation succeeded

        # Return audio directly
        return Response(content=audio_bytes, media_type="audio/mpeg")

    except tts_service.QuotaExceededError as e:
        raise HTTPException(status_code=429, detail="API quota exceeded.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Gemini AI Routes ────────────────────────────────────────────────────────

@router.post("/chat")
async def chat(req: ChatRequest):
    try:
        res = await gemini_service.chat_with_assistant(req.message, req.history)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/summarize")
async def summarize(req: SummarizeRequest):
    try:
        res = await gemini_service.summarize(req.text)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/translate")
async def translate(req: TranslateRequest):
    try:
        res = await gemini_service.translate(req.text, req.target_language)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/rewrite")
async def rewrite(req: RewriteRequest):
    try:
        res = await gemini_service.rewrite_for_grade(req.text, req.grade)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/generate-homework")
async def generate_homework(req: HomeworkRequest):
    try:
        res = await gemini_service.generate_homework(req.topic)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/generate-announcement")
async def generate_announcement(req: AnnouncementRequest):
    try:
        res = await gemini_service.generate_announcement(req.topic)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/generate-revision")
async def generate_revision(req: RevisionRequest):
    try:
        res = await gemini_service.generate_revision(req.topic)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/generate-reading")
async def generate_reading(req: ReadingRequest):
    try:
        res = await gemini_service.generate_reading(req.topic)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/generate-assembly")
async def generate_assembly(req: AssemblyRequest):
    try:
        res = await gemini_service.generate_assembly(req.topic)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/generate-lesson")
async def generate_lesson(req: LessonRequest):
    try:
        res = await gemini_service.generate_lesson(req.topic)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/generate-story")
async def generate_story(req: StoryRequest):
    try:
        res = await gemini_service.generate_story(req.topic)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/generate-quiz")
async def generate_quiz(req: QuizRequest):
    try:
        res = await gemini_service.generate_quiz(req.topic)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/generate-debate")
async def generate_debate(req: DebateRequest):
    try:
        res = await gemini_service.generate_debate(req.topic)
        return {"result": res}
    except Exception as e:
        raise HTTPException(500, str(e))

# ── PDF Upload Route ────────────────────────────────────────────────────────

@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Must be a PDF file")
    
    try:
        content = await file.read()
        reader = PdfReader(io.BytesIO(content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
            
        if not text.strip():
            raise HTTPException(400, "Could not extract text from PDF")
            
        return {"filename": file.filename, "text": text[:15000]}  # limit text
    except Exception as e:
        raise HTTPException(500, f"Error processing PDF: {str(e)}")


# ── History Routes ──────────────────────────────────────────────────────────

@router.get("/history")
async def get_history(
    user_id: str, 
    q: str = None, 
    sort_by: str = "created_at", 
    sort_dir: str = "desc",
    language: str = None,
    favorites: bool = None,
    page: int = 1,
    limit: int = 10
):
    try:
        query = db.table("audio_history").select("*", count="exact").eq("user_id", user_id)
        
        if q:
            query = query.ilike("title", f"%{q}%")
        if language:
            query = query.eq("language", language)
        if favorites:
            query = query.eq("is_favorite", True)
            
        query = query.order(sort_by, desc=(sort_dir == "desc"))
        
        # Pagination
        start = (page - 1) * limit
        end = start + limit - 1
        query = query.range(start, end)
        
        res = query.execute()
        return {"items": res.data, "total": res.count}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.patch("/history/{item_id}")
async def update_history(item_id: str, req: HistoryUpdateRequest):
    try:
        updates = {k: v for k, v in req.model_dump().items() if v is not None}
        if not updates:
            return {"success": True}
            
        res = db.table("audio_history").update(updates).eq("id", item_id).execute()
        return {"success": True, "item": res.data[0] if res.data else None}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/history/{item_id}")
async def delete_history(item_id: str):
    try:
        # Note: In a real app, delete the file from storage too
        db.table("audio_history").delete().eq("id", item_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Templates Routes ────────────────────────────────────────────────────────

@router.get("/templates")
async def list_templates(user_id: str):
    try:
        res = db.table("templates").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"templates": res.data}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/templates")
async def create_template(user_id: str, req: TemplateCreateRequest):
    try:
        data = req.model_dump()
        data["user_id"] = user_id
        res = db.table("templates").insert(data).execute()
        return {"template": res.data[0]}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.patch("/templates/{item_id}")
async def update_template(item_id: str, req: TemplateUpdateRequest):
    try:
        updates = {k: v for k, v in req.model_dump().items() if v is not None}
        if not updates:
            return {"success": True}
            
        res = db.table("templates").update(updates).eq("id", item_id).execute()
        return {"template": res.data[0] if res.data else None}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/templates/{item_id}")
async def delete_template(item_id: str):
    try:
        db.table("templates").delete().eq("id", item_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(500, str(e))
