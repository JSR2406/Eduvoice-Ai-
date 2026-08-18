"""
AI service — summarization, translation, grade-rewriting, content generation using OpenRouter API.
"""

import json
import logging
import httpx
import os
from pathlib import Path
from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Base directory for prompts (root/prompts)
PROMPTS_DIR = Path(__file__).resolve().parent.parent.parent / "prompts"

def load_prompt(prompt_name: str, **kwargs) -> str:
    prompt_path = PROMPTS_DIR / f"{prompt_name}.txt"
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            template = f.read()
        return template.format(**kwargs)
    except Exception as e:
        logger.error(f"Error loading prompt {prompt_name}: {e}")
        # Fallback empty string or raise
        raise RuntimeError(f"Could not load prompt: {prompt_name}")

from app.services.sarvam_service import SarvamService

async def _ask(prompt: str) -> str:
    sarvam = SarvamService()
    try:
        return await sarvam.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            model="sarvam-105b-conversations"
        )
    except Exception as e:
        logger.error(f"Sarvam API Error in _ask: {e}")
        raise e

async def chat_with_assistant(message: str, history: list[dict] = None) -> str:
    sarvam = SarvamService()
    messages = [{"role": "system", "content": "You are a helpful teaching assistant AI. You talk to teachers to help them create lesson plans, grade, or generate ideas. Keep responses concise, clear, and easy to be spoken out loud."}]
    if history:
        for msg in history[-10:]:  # Keep last 10 messages for context
            messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    try:
        return await sarvam.chat_completion(
            messages=messages,
            model="sarvam-105b-conversations"
        )
    except Exception as e:
        logger.error(f"Sarvam API Error in chat_with_assistant: {e}")
        raise e

# ── Summarize ────────────────────────────────────────────────────────────────

async def summarize(text: str) -> str:
    prompt = load_prompt("summarizer", text=text)
    return await _ask(prompt)


# ── Translate ────────────────────────────────────────────────────────────────

LANG_NAMES = {
    "hi": "Hindi", "mr": "Marathi", "gu": "Gujarati",
    "ta": "Tamil",  "en": "English",
}


async def translate(text: str, target_language: str) -> str:
    sarvam = SarvamService()
    t_lang = target_language if "-" in target_language else f"{target_language}-IN"
    # Fallback for English since Mayura doesn't strictly have en-IN to en-IN.
    if target_language == "en":
        return text
    try:
        return await sarvam.translate(text, "en-IN", t_lang)
    except Exception as e:
        logger.error(f"Sarvam Translation Error: {e}")
        raise e


# ── Rewrite for Grade ────────────────────────────────────────────────────────

async def rewrite_for_grade(text: str, grade: str) -> str:
    prompt = load_prompt("lesson_simplifier", grade=grade, text=text)
    return await _ask(prompt)


# ── Homework Generator ───────────────────────────────────────────────────────

async def generate_homework(topic: str) -> str:
    prompt = load_prompt("homework_generator", topic=topic)
    return await _ask(prompt)


# ── Announcement Generator ───────────────────────────────────────────────────

async def generate_announcement(topic: str) -> str:
    prompt = load_prompt("announcement_generator", topic=topic)
    return await _ask(prompt)


# ── Revision Notes ───────────────────────────────────────────────────────────

async def generate_revision(topic: str) -> str:
    prompt = load_prompt("revision_generator", topic=topic)
    return await _ask(prompt)


# ── Reading Passage ──────────────────────────────────────────────────────────

async def generate_reading(topic: str) -> str:
    prompt = load_prompt("reading_generator", topic=topic)
    return await _ask(prompt)


# ── Morning Assembly ─────────────────────────────────────────────────────────

async def generate_assembly(topic: str = "") -> str:
    prompt = load_prompt("assembly_prompt", topic=topic if topic else "General Morning Assembly")
    return await _ask(prompt)


# ── Additional Generators ───────────────────────────────────────────────────

async def generate_lesson(topic: str) -> str:
    prompt = load_prompt("lesson_generator", topic=topic)
    return await _ask(prompt)

async def generate_story(topic: str) -> str:
    prompt = load_prompt("story_generator", topic=topic)
    return await _ask(prompt)

async def generate_quiz(topic: str) -> str:
    prompt = load_prompt("quiz_generator", topic=topic)
    return await _ask(prompt)

async def generate_debate(topic: str) -> str:
    prompt = load_prompt("debate_generator", topic=topic)
    return await _ask(prompt)