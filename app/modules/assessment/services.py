import logging
from app.extensions import db
from app.models.session import QuizSession, QuestionAttempt
from app.models.quiz import Quiz, Question
from app.models.lectures import Lecture, Slide

logger = logging.getLogger(__name__)


def get_session_result(session_id: str, user_id: str) -> tuple:
    logger.info(f"📊 Session result | session_id={session_id}")

    session = QuizSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return {"error": "Session not found"}, 404

    attempts = QuestionAttempt.query.filter_by(session_id=session_id).all()
    
    questions = []
    for att in attempts:
        q = Question.query.get(att.question_id)
        if q:
            questions.append({
                "question_id": str(q.id),
                "question": q.question_text,
                "options": q.options,
                "student_answer": att.student_answer,
                "correct_answer": q.correct_answer,
                "is_correct": att.is_correct,
                "slide_ref": q.slide_id
            })

    return {
        "session_id": str(session.id),
        "lecture_id": str(session.lecture_id),
        "score": session.score,
        "total": 100,
        "correct": session.correct_count,
        "wrong": session.wrong_count,
        "xp_earned": session.xp_earned,
        "time_taken": session.time_taken_seconds,
        "questions": questions
    }, 200


def get_lecture_progress(lecture_id: str, user_id: str) -> tuple:
    logger.info(f"📊 Lecture progress | lecture_id={lecture_id}")

    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    if not lecture:
        return {"error": "Lecture not found"}, 404

    sessions = QuizSession.query.filter_by(lecture_id=lecture_id, user_id=user_id).all()
    
    if not sessions:
        return {
            "lecture_id": lecture_id,
            "total_sessions": 0,
            "average_score": 0,
            "best_score": 0,
            "worst_score": 0,
            "total_xp": 0,
            "weak_slides": [],
            "strong_slides": []
        }, 200

    scores = [s.score for s in sessions]
    total_xp = sum(s.xp_earned for s in sessions)

    # Weak slides detection
    slide_stats = {}
    for session in sessions:
        attempts = QuestionAttempt.query.filter_by(session_id=session.id).all()
        for att in attempts:
            q = Question.query.get(att.question_id)
            if q and q.slide_id:
                slide = Slide.query.get(q.slide_id)
                if slide:
                    slide_num = slide.slide_number
                    if slide_num not in slide_stats:
                        slide_stats[slide_num] = {"correct": 0, "wrong": 0}
                    
                    if att.is_correct:
                        slide_stats[slide_num]["correct"] += 1
                    else:
                        slide_stats[slide_num]["wrong"] += 1

    weak_slides = []
    strong_slides = []
    
    for slide_num, stats in slide_stats.items():
        total = stats["correct"] + stats["wrong"]
        if total > 0:
            wrong_percent = (stats["wrong"] / total) * 100
            if wrong_percent > 50:
                weak_slides.append(slide_num)
            elif wrong_percent < 30:
                strong_slides.append(slide_num)

    return {
        "lecture_id": lecture_id,
        "total_sessions": len(sessions),
        "average_score": round(sum(scores) / len(scores)),
        "best_score": max(scores),
        "worst_score": min(scores),
        "total_xp": total_xp,
        "weak_slides": sorted(weak_slides),
        "strong_slides": sorted(strong_slides)
    }, 200


def get_dashboard_progress(user_id: str) -> tuple:
    logger.info(f"📊 Dashboard | user_id={user_id}")

    lectures = Lecture.query.filter_by(user_id=user_id).all()
    all_sessions = QuizSession.query.filter_by(user_id=user_id).all()

    if not all_sessions:
        return {
            "total_lectures": len(lectures),
            "total_quizzes": 0,
            "total_xp": 0,
            "average_score": 0,
            "lectures": []
        }, 200

    total_xp = sum(s.xp_earned for s in all_sessions)
    avg_score = round(sum(s.score for s in all_sessions) / len(all_sessions))

    lecture_stats = []
    for lec in lectures:
        lec_sessions = [s for s in all_sessions if str(s.lecture_id) == str(lec.id)]
        if lec_sessions:
            lecture_stats.append({
                "lecture_id": str(lec.id),
                "title": lec.title,
                "sessions": len(lec_sessions),
                "average_score": round(sum(s.score for s in lec_sessions) / len(lec_sessions)),
                "xp_earned": sum(s.xp_earned for s in lec_sessions)
            })

    return {
        "total_lectures": len(lectures),
        "total_quizzes": len(all_sessions),
        "total_xp": total_xp,
        "average_score": avg_score,
        "lectures": lecture_stats
    }, 200