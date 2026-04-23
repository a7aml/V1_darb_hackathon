import logging
from app.extensions import db
from app.models.lectures import Lecture
from app.modules.rag.retriever import retrieve_relevant_chunks
from app.shared.openai_client import generate

logger = logging.getLogger(__name__)


def lang_instruction(language: str) -> str:
    if language == "ar":
        return "أجب باللغة العربية فقط."
    return "Reply in English only."


def ask_question(lecture_id: str, user_id: str, message: str) -> tuple:
    logger.info(f"💬 Chatbot question | lecture_id={lecture_id}")

    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    if not lecture:
        return {"error": "Lecture not found"}, 404

    if not message or len(message.strip()) < 3:
        return {"error": "Message too short"}, 400

    # Use RAG to find relevant slides
    try:
        chunks = retrieve_relevant_chunks(message, lecture_id, top_k=3)
        
        if not chunks:
            return {
                "lecture_id": lecture_id,
                "question": message,
                "answer": "I couldn't find relevant information in this lecture to answer your question.",
                "source_slides": [],
                "confidence": 0
            }, 200

        # Build context from chunks
        context = "\n\n".join([f"Slide {c['slide_number']}:\n{c['content']}" for c in chunks])
        source_slides = [c['slide_number'] for c in chunks]
        avg_similarity = sum(c['similarity'] for c in chunks) / len(chunks)

        lang = lang_instruction(lecture.language)

        prompt = f"""{lang}
You are a helpful teaching assistant. Answer the student's question based on the lecture content provided.

Lecture content:
{context}

Student question: {message}

Instructions:
- Answer clearly and concisely
- Base answer only on the provided content
- If content doesn't contain the answer, say so
- Be helpful and encouraging
"""

        answer = generate(prompt)

        logger.info(f"✅ Chatbot answered | confidence={avg_similarity:.2f}")

        return {
            "lecture_id": lecture_id,
            "question": message,
            "answer": answer,
            "source_slides": source_slides,
            "confidence": round(avg_similarity, 2)
        }, 200

    except Exception as e:
        logger.error(f"❌ Chatbot failed: {str(e)}")
        return {"error": "Failed to process question"}, 500