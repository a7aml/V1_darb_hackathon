import json
import logging
from app.extensions import db
from app.models.lectures import Lecture, Slide
from app.shared.openai_client import generate

logger = logging.getLogger(__name__)


# ─── HELPERS ──────────────────────────────────────────────

def get_lecture_or_error(lecture_id: str, user_id: str):
    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    if not lecture:
        return None, ({"error": "Lecture not found"}, 404)
    return lecture, None


def get_slide_or_error(lecture_id: str, slide_number: int):
    slide = Slide.query.filter_by(
        lecture_id=lecture_id,
        slide_number=slide_number
    ).first()
    if not slide:
        return None, ({"error": f"Slide {slide_number} not found"}, 404)
    return slide, None


def lang_instruction(language: str) -> str:
    if language == "ar":
        return "أجب باللغة العربية فقط."
    return "Reply in English only."


def safe_parse_json(text: str) -> dict | list | None:
    """Strip markdown fences and parse JSON safely."""
    try:
        clean = text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception:
        return None


# ─── 1. SUMMARY ───────────────────────────────────────────

def get_summary(lecture_id: str, user_id: str) -> tuple:
    logger.info(f"📝 Summary request | lecture_id={lecture_id}")

    lecture, err = get_lecture_or_error(lecture_id, user_id)
    if err:
        return err

    slides = Slide.query.filter_by(lecture_id=lecture_id).order_by(Slide.slide_number).all()
    if not slides:
        return {"error": "No slides found for this lecture"}, 404

    full_content = "\n\n".join([
        f"Slide {s.slide_number}:\n{s.content}" for s in slides
    ])

    lang = lang_instruction(lecture.language)

    prompt = f"""{lang}
You are an expert educator. Summarize the following lecture content clearly and concisely.
Cover all main topics. Use bullet points for clarity.

Lecture: {lecture.title}

{full_content}
"""
    try:
        summary = generate(prompt)
        logger.info(f"✅ Summary generated | lecture_id={lecture_id}")
        return {
            "lecture_id": lecture_id,
            "title": lecture.title,
            "language": lecture.language,
            "summary": summary
        }, 200
    except Exception as e:
        logger.error(f"❌ Summary generation failed: {str(e)}")
        return {"error": "Failed to generate summary"}, 500


# ─── 2. EXPLAIN SLIDE ─────────────────────────────────────

def explain_slide(lecture_id: str, slide_number: int, user_id: str) -> tuple:
    logger.info(f"📖 Explain slide | lecture_id={lecture_id} | slide={slide_number}")

    lecture, err = get_lecture_or_error(lecture_id, user_id)
    if err:
        return err

    slide, err = get_slide_or_error(lecture_id, slide_number)
    if err:
        return err

    lang = lang_instruction(lecture.language)

    prompt = f"""{lang}
You are an expert educator. Explain the following slide content in a clear, detailed, and engaging way.
Use simple language. Give examples where helpful.

Slide {slide_number} content:
{slide.content}
"""
    try:
        explanation = generate(prompt)
        logger.info(f"✅ Explanation generated | slide={slide_number}")
        return {
            "lecture_id": lecture_id,
            "slide_number": slide_number,
            "language": lecture.language,
            "explanation": explanation
        }, 200
    except Exception as e:
        logger.error(f"❌ Explanation failed: {str(e)}")
        return {"error": "Failed to generate explanation"}, 500


# ─── 3. FLASHCARDS ────────────────────────────────────────

def get_flashcards(lecture_id: str, user_id: str) -> tuple:
    logger.info(f"🃏 Flashcards request | lecture_id={lecture_id}")

    lecture, err = get_lecture_or_error(lecture_id, user_id)
    if err:
        return err

    slides = Slide.query.filter_by(lecture_id=lecture_id).order_by(Slide.slide_number).all()
    if not slides:
        return {"error": "No slides found"}, 404

    full_content = "\n\n".join([
        f"Slide {s.slide_number}:\n{s.content}" for s in slides
    ])

    lang = lang_instruction(lecture.language)

    prompt = f"""{lang}
You are an expert educator. Generate flashcards from the following lecture content.
Return ONLY a valid JSON array. No extra text. No markdown.

Each flashcard must have:
- "id": number starting from 1
- "front": a question or key concept
- "back": the answer or explanation
- "slide_ref": the slide number it came from

Generate at least 2 flashcards per slide. Maximum 20 total.

Lecture content:
{full_content}
"""
    try:
        response = generate(prompt)
        flashcards = safe_parse_json(response)

        if not flashcards or not isinstance(flashcards, list):
            logger.error("❌ Flashcards JSON parse failed")
            return {"error": "Failed to parse flashcards"}, 500

        logger.info(f"✅ Flashcards generated | count={len(flashcards)}")
        return {
            "lecture_id": lecture_id,
            "language": lecture.language,
            "flashcards": flashcards
        }, 200
    except Exception as e:
        logger.error(f"❌ Flashcards generation failed: {str(e)}")
        return {"error": "Failed to generate flashcards"}, 500


# ─── 4. MIND MAP ──────────────────────────────────────────

def get_mindmap(lecture_id: str, user_id: str) -> tuple:
    logger.info(f"🧠 Mind map request | lecture_id={lecture_id}")

    lecture, err = get_lecture_or_error(lecture_id, user_id)
    if err:
        return err

    slides = Slide.query.filter_by(lecture_id=lecture_id).order_by(Slide.slide_number).all()
    if not slides:
        return {"error": "No slides found"}, 404

    full_content = "\n\n".join([
        f"Slide {s.slide_number}:\n{s.content}" for s in slides
    ])

    lang = lang_instruction(lecture.language)

    prompt = f"""{lang}
You are an expert educator. Generate a mind map structure from the following lecture.
Return ONLY a valid JSON object. No extra text. No markdown.

Structure:
{{
  "central": "Main lecture topic",
  "branches": [
    {{
      "id": "1",
      "label": "Main concept",
      "children": [
        {{
          "id": "1-1",
          "label": "Sub concept",
          "children": []
        }}
      ]
    }}
  ]
}}

Keep labels short (max 5 words each).
Maximum 5 main branches. Maximum 3 children per branch.

Lecture: {lecture.title}
{full_content}
"""
    try:
        response = generate(prompt)
        mindmap = safe_parse_json(response)

        if not mindmap or not isinstance(mindmap, dict):
            logger.error("❌ Mind map JSON parse failed")
            return {"error": "Failed to parse mind map"}, 500

        logger.info(f"✅ Mind map generated | lecture_id={lecture_id}")
        return {
            "lecture_id": lecture_id,
            "language": lecture.language,
            "mindmap": mindmap
        }, 200
    except Exception as e:
        logger.error(f"❌ Mind map generation failed: {str(e)}")
        return {"error": "Failed to generate mind map"}, 500


# ─── 5. GLOSSARY ──────────────────────────────────────────

def get_glossary(lecture_id: str, user_id: str) -> tuple:
    logger.info(f"📚 Glossary request | lecture_id={lecture_id}")

    lecture, err = get_lecture_or_error(lecture_id, user_id)
    if err:
        return err

    slides = Slide.query.filter_by(lecture_id=lecture_id).order_by(Slide.slide_number).all()
    if not slides:
        return {"error": "No slides found"}, 404

    full_content = "\n\n".join([
        f"Slide {s.slide_number}:\n{s.content}" for s in slides
    ])

    lang = lang_instruction(lecture.language)

    prompt = f"""{lang}
You are an expert educator. Extract key terms and concepts from the following lecture.
Return ONLY a valid JSON array. No extra text. No markdown.

Each term must have:
- "id": number starting from 1
- "term": the key term or concept
- "definition": simple clear definition (1-2 sentences)
- "example": a practical example
- "slide_ref": slide number where term appears

Extract maximum 15 most important terms.

Lecture content:
{full_content}
"""
    try:
        response = generate(prompt)
        glossary = safe_parse_json(response)

        if not glossary or not isinstance(glossary, list):
            logger.error("❌ Glossary JSON parse failed")
            return {"error": "Failed to parse glossary"}, 500

        logger.info(f"✅ Glossary generated | terms={len(glossary)}")
        return {
            "lecture_id": lecture_id,
            "language": lecture.language,
            "glossary": glossary
        }, 200
    except Exception as e:
        logger.error(f"❌ Glossary generation failed: {str(e)}")
        return {"error": "Failed to generate glossary"}, 500


# ─── 6. TL;DR ─────────────────────────────────────────────

def get_tldr(lecture_id: str, slide_number: int, user_id: str) -> tuple:
    logger.info(f"⚡ TLDR request | lecture_id={lecture_id} | slide={slide_number}")

    lecture, err = get_lecture_or_error(lecture_id, user_id)
    if err:
        return err

    slide, err = get_slide_or_error(lecture_id, slide_number)
    if err:
        return err

    lang = lang_instruction(lecture.language)

    prompt = f"""{lang}
Summarize the following slide content in ONE sentence only. Maximum 20 words.
Be direct and clear.

Slide content:
{slide.content}
"""
    try:
        tldr = generate(prompt)
        logger.info(f"✅ TLDR generated | slide={slide_number}")
        return {
            "lecture_id": lecture_id,
            "slide_number": slide_number,
            "language": lecture.language,
            "tldr": tldr.strip()
        }, 200
    except Exception as e:
        logger.error(f"❌ TLDR generation failed: {str(e)}")
        return {"error": "Failed to generate TL;DR"}, 500