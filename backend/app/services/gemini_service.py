"""
AI service — summarization, translation, grade-rewriting, content generation using OpenRouter API.
"""

import json
import logging
import httpx
from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Default to Google Gemini 1.5 Flash via OpenRouter for cost-effective speed
OPENROUTER_MODEL = "google/gemini-1.5-flash"


async def _ask(prompt: str) -> str:
    if not settings.openrouter_api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not set in .env")

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "HTTP-Referer": "http://localhost:5173",  # Optional, for OpenRouter rankings
        "X-Title": "EduVoice AI",                 # Optional, for OpenRouter rankings
        "Content-Type": "application/json",
    }

    data = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
        
        if r.status_code != 200:
            logger.error("OpenRouter Error: %s", r.text)
            r.raise_for_status()

        res = r.json()
        if "choices" in res and len(res["choices"]) > 0:
            return res["choices"][0]["message"]["content"].strip()
        return ""


# ── Summarize ────────────────────────────────────────────────────────────────

async def summarize(text: str) -> str:
    prompt = f"""
You are an expert educational content creator for teachers.
Summarize the following text into a clear, concise audio script suitable for students.
Keep it engaging, under 300 words, and use simple language.
Return ONLY the summarized text, no headers or JSON.

TEXT:
{text}
"""
    return await _ask(prompt)


# ── Translate ────────────────────────────────────────────────────────────────

LANG_NAMES = {
    "hi": "Hindi", "mr": "Marathi", "gu": "Gujarati",
    "ta": "Tamil",  "en": "English",
}


async def translate(text: str, target_language: str) -> str:
    lang = LANG_NAMES.get(target_language, target_language)
    prompt = f"""
Translate the following educational text into {lang}.
Keep the educational tone, make it natural for a teacher speaking to students.
Return ONLY the translated text, nothing else.

TEXT:
{text}
"""
    return await _ask(prompt)


# ── Rewrite for Grade ────────────────────────────────────────────────────────

async def rewrite_for_grade(text: str, grade: str) -> str:
    prompt = f"""
Rewrite the following educational content for {grade} students.
Adjust vocabulary, sentence complexity, and examples appropriately.
Make it suitable for a teacher to read aloud as an audio lesson.
Return ONLY the rewritten text, no explanations.

TEXT:
{text}
"""
    return await _ask(prompt)


# ── Homework Generator ───────────────────────────────────────────────────────

async def generate_homework(topic: str) -> str:
    prompt = f"""
Generate clear, well-structured homework instructions for students based on this topic/description:
"{topic}"

Include:
- Subject and topic
- Clear task instructions (numbered steps)
- Submission deadline placeholder
- Materials needed (if any)

Write it as a teacher would speak it aloud. Under 200 words. Return ONLY the homework text.
"""
    return await _ask(prompt)


# ── Announcement Generator ───────────────────────────────────────────────────

async def generate_announcement(topic: str) -> str:
    prompt = f"""
Write a professional school announcement script based on this topic:
"{topic}"

The announcement should:
- Be formal and clear
- Mention relevant details (dates, venue, participants)
- End with a call to action or important reminder
- Be suitable for reading aloud over PA system or as audio message
- Be under 150 words

Return ONLY the announcement text.
"""
    return await _ask(prompt)


# ── Revision Notes ───────────────────────────────────────────────────────────

async def generate_revision(topic: str) -> str:
    prompt = f"""
Create concise audio revision notes for students on this topic: "{topic}"

Include:
- Key definitions (3-5)
- Important points to remember (bulleted, read-aloud style)
- One memorable example or analogy
- Quick recap at the end

Format it as natural spoken audio — no markdown, no bullet symbols, just flowing sentences.
Under 300 words. Return ONLY the revision script.
"""
    return await _ask(prompt)


# ── Reading Passage ──────────────────────────────────────────────────────────

async def generate_reading(topic: str) -> str:
    prompt = f"""
Write an engaging reading practice passage for students on: "{topic}"

Requirements:
- Grade-appropriate vocabulary
- Interesting and educational narrative
- 150-200 words
- Written to be read aloud with natural pauses
- Include 2-3 comprehension check phrases like "Think about this…"

Return ONLY the reading passage text.
"""
    return await _ask(prompt)


# ── Morning Assembly ─────────────────────────────────────────────────────────

async def generate_assembly(topic: str = "") -> str:
    prompt = f"""
Write a complete morning school assembly script.
{f'Theme or focus: {topic}' if topic else ''}

Include:
- Welcome and good morning greeting
- Thought of the day (motivational quote with brief explanation)
- One interesting fact or general knowledge point
- School-related announcement placeholder
- Closing motivational message

Written as natural spoken language for a student presenter.
Keep it energetic and positive. Under 250 words.
Return ONLY the assembly script.
"""
    return await _ask(prompt)
