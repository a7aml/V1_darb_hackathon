import logging
from app.extensions import db
from app.models.lectures import Lecture, Slide
from app.modules.assessment.services import get_lecture_progress
from app.shared.openai_client import generate

logger = logging.getLogger(__name__)


def get_recommendations(lecture_id: str, user_id: str) -> tuple:
    logger.info(f"💡 Recommendations | lecture_id={lecture_id}")

    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    if not lecture:
        return {"error": "Lecture not found"}, 404

    # Get progress to find weak slides
    progress, _ = get_lecture_progress(lecture_id, user_id)
    weak_slides = progress.get("weak_slides", [])

    if not weak_slides:
        return {
            "lecture_id": lecture_id,
            "weak_topics": [],
            "general_advice": "Great job! No weak areas detected. Keep practicing to maintain your performance.",
            "suggested_actions": []
        }, 200

    # Get weak slide content
    weak_content = []
    for slide_num in weak_slides:
        slide = Slide.query.filter_by(lecture_id=lecture_id, slide_number=slide_num).first()
        if slide:
            weak_content.append(f"Slide {slide_num}: {slide.content[:200]}")

    lang = "أجب باللغة العربية فقط." if lecture.language == "ar" else "Reply in English only."

    prompt = f"""{lang}
You are an expert educator analyzing student performance.

The student has shown weakness in these topics:
{chr(10).join(weak_content)}

Provide personalized recommendations:
1. For each weak topic, give specific advice
2. Suggest study techniques
3. Recommend what to focus on

Keep advice practical and encouraging.
"""

    try:
        advice = generate(prompt)
        
        return {
            "lecture_id": lecture_id,
            "weak_topics": [
                {
                    "slide_number": num,
                    "weakness_score": 60,
                    "recommendation": f"Review slide {num} concepts"
                } for num in weak_slides
            ],
            "general_advice": advice,
            "suggested_actions": [
                f"Re-study slide {weak_slides[0]}",
                "Take another quiz on medium difficulty",
                "Review flashcards for weak topics"
            ]
        }, 200

    except Exception as e:
        logger.error(f"❌ Recommendation failed: {str(e)}")
        return {"error": "Failed to generate recommendations"}, 500