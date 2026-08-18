from pydantic import BaseModel, Field
from typing import Optional


class GenerateAudioRequest(BaseModel):
    text:             str    = Field(..., min_length=1, max_length=5000)
    voice_id:         str    = Field(default="")
    language:         str    = Field(default="en")
    emotion:          str    = Field(default="neutral")
    speed:            float  = Field(default=1.0, ge=0.5, le=2.0)
    stability:        float  = Field(default=0.5, ge=0.0, le=1.0)
    similarity_boost: float  = Field(default=0.75, ge=0.0, le=1.0)
    save_to_history:  bool   = Field(default=True)
    title:            Optional[str] = None
    user_id:          Optional[str] = None


class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=15000)


class TranslateRequest(BaseModel):
    text:            str = Field(..., min_length=1, max_length=5000)
    target_language: str = Field(default="hi")


class RewriteRequest(BaseModel):
    text:  str = Field(..., min_length=1, max_length=5000)
    grade: str = Field(default="Grade 7-8")


class HomeworkRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=2000)


class AnnouncementRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=2000)


class RevisionRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=2000)


class ReadingRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=2000)


class AssemblyRequest(BaseModel):
    topic: Optional[str] = None


class LessonRequest(BaseModel):
    topic: str


class StoryRequest(BaseModel):
    topic: str


class QuizRequest(BaseModel):
    topic: str


class DebateRequest(BaseModel):
    topic: str


class HistoryUpdateRequest(BaseModel):
    title:       Optional[str]  = None
    is_favorite: Optional[bool] = None


class TemplateCreateRequest(BaseModel):
    title:       str
    description: str  = ""
    emoji:       str  = "📋"
    category:    str  = "Custom"
    content:     str  = ""


class TemplateUpdateRequest(BaseModel):
    title:       Optional[str]  = None
    description: Optional[str]  = None
    emoji:       Optional[str]  = None
    category:    Optional[str]  = None
    is_favorite: Optional[bool] = None

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: list[dict] = Field(default_factory=list)
