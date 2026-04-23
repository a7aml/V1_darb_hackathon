import json
import logging
from app.extensions import db
from app.models.lectures import Lecture, Slide
from app.models.quiz import Quiz, Question
from app.models.session import QuizSession, QuestionAttempt
from app.shared.openai_client import generate

logger = logging.getLogger(__name__)

# ─── CONSTANTS ────────────────────────────────────────────
VALID_TYPES       = ["mcq", "true_false"]
VALID_DIFFICULTIES = ["easy", "medium", "hard"]
MAX_QUESTIONS     = 20
MIN_QUESTIONS     = 1

# XP per correct answer based on difficulty
XP_MAP = {
    "easy":   5,
    "medium": 10,
    "hard":   15
}


# ─── HELPERS ──────────────────────────────────────────────

def lang_instruction(language: str) -> str:
    if language == "ar":
        return "أجب باللغة العربية فقط."
    return "Reply in English only."


def safe_parse_json(text: str):
    try:
        clean = text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception:
        return None


def calculate_xp(correct_count: int, difficulty: str) -> int:
    return correct_count * XP_MAP.get(difficulty, 10)


# ─── 1. GENERATE QUIZ ─────────────────────────────────────

def generate_quiz(
    lecture_id: str,
    user_id: str,
    quiz_type: str,
    difficulty: str,
    num_questions: int,
    slide_number: int = None
) -> tuple:

    logger.info(f"🎯 Generate quiz | lecture={lecture_id} | type={quiz_type} | difficulty={difficulty} | num={num_questions}")

    # ── VALIDATIONS ──
    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    if not lecture:
        return {"error": "Lecture not found"}, 404

    if quiz_type not in VALID_TYPES:
        return {"error": f"Invalid type. Must be one of: {VALID_TYPES}"}, 400

    if difficulty not in VALID_DIFFICULTIES:
        return {"error": f"Invalid difficulty. Must be one of: {VALID_DIFFICULTIES}"}, 400

    if not (MIN_QUESTIONS <= num_questions <= MAX_QUESTIONS):
        return {"error": f"num_questions must be between {MIN_QUESTIONS} and {MAX_QUESTIONS}"}, 400

    # ── GET SLIDES ──
    if slide_number:
        slide = Slide.query.filter_by(lecture_id=lecture_id, slide_number=slide_number).first()
        if not slide:
            return {"error": f"Slide {slide_number} not found"}, 404
        slides = [slide]
    else:
        slides = Slide.query.filter_by(lecture_id=lecture_id).order_by(Slide.slide_number).all()
        if not slides:
            return {"error": "No slides found for this lecture"}, 404

    content = "\n\n".join([f"Slide {s.slide_number}:\n{s.content}" for s in slides])
    lang    = lang_instruction(lecture.language)

    # ── BUILD PROMPT ──
    if quiz_type == "mcq":
        prompt = f"""{lang}
You are an expert educator. Generate exactly {num_questions} multiple choice questions from the lecture content below.
Difficulty level: {difficulty}
- easy: basic recall and definitions
- medium: understanding and application
- hard: analysis and critical thinking

Return ONLY a valid JSON array. No extra text. No markdown.

Each question must have:
- "question": the question text
- "options": array of exactly 4 options labeled ["A) ...", "B) ...", "C) ...", "D) ..."]
- "correct_answer": the correct option label only ("A", "B", "C", or "D")
- "difficulty": "{difficulty}"
- "slide_ref": slide number the question is based on

Lecture content:
{content}
"""
    else:  # true_false
        prompt = f"""{lang}
You are an expert educator. Generate exactly {num_questions} true or false questions from the lecture content below.
Difficulty level: {difficulty}

Return ONLY a valid JSON array. No extra text. No markdown.

Each question must have:
- "question": the statement (should be clearly true or false)
- "options": ["True", "False"]
- "correct_answer": "True" or "False"
- "difficulty": "{difficulty}"
- "slide_ref": slide number the question is based on

Lecture content:
{content}
"""

    try:
        response   = generate(prompt)
        questions_data = safe_parse_json(response)

        if not questions_data or not isinstance(questions_data, list):
            logger.error("❌ Quiz JSON parse failed")
            return {"error": "Failed to generate questions. Please try again."}, 500

        # Limit to requested number
        questions_data = questions_data[:num_questions]

        # ── SAVE QUIZ TO DB ──
        quiz = Quiz(
            lecture_id=lecture_id,
            user_id=user_id,
            type=quiz_type,
            difficulty=difficulty,
            total_questions=len(questions_data)
        )
        db.session.add(quiz)
        db.session.flush()

        # ── SAVE QUESTIONS TO DB ──
        saved_questions = []
        for i, q in enumerate(questions_data):
            # Find slide_id from slide_ref
            slide_ref = q.get("slide_ref")
            slide_id  = None
            if slide_ref:
                s = Slide.query.filter_by(lecture_id=lecture_id, slide_number=slide_ref).first()
                if s:
                    slide_id = s.id

            question = Question(
                quiz_id=quiz.id,
                slide_id=slide_id,
                question_text=q.get("question", ""),
                options=q.get("options", []),
                correct_answer=q.get("correct_answer", ""),
                difficulty=difficulty
            )
            db.session.add(question)
            db.session.flush()

            saved_questions.append({
                "id":         str(question.id),
                "question":   question.question_text,
                "type":       quiz_type,
                "difficulty": difficulty,
                "options":    question.options,
                "slide_ref":  slide_ref
            })

        db.session.commit()
        logger.info(f"✅ Quiz generated | quiz_id={quiz.id} | questions={len(saved_questions)}")

        return {
            "quiz_id":   str(quiz.id),
            "type":      quiz_type,
            "difficulty": difficulty,
            "language":  lecture.language,
            "questions": saved_questions
        }, 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Quiz generation failed: {str(e)}")
        return {"error": "Failed to generate quiz"}, 500


# ─── 2. SUBMIT QUIZ ───────────────────────────────────────

def submit_quiz(
    quiz_id: str,
    lecture_id: str,
    user_id: str,
    time_taken: int,
    answers: list
) -> tuple:

    logger.info(f"📝 Submit quiz | quiz_id={quiz_id} | user_id={user_id}")

    # ── VALIDATIONS ──
    quiz = Quiz.query.filter_by(id=quiz_id, user_id=user_id).first()
    if not quiz:
        return {"error": "Quiz not found"}, 404

    if not answers or not isinstance(answers, list):
        return {"error": "Answers are required"}, 400

    # ── SCORE CALCULATION ──
    correct_count = 0
    wrong_count   = 0
    attempt_records = []

    for answer in answers:
        question_id    = answer.get("question_id")
        student_answer = answer.get("answer", "").strip().upper()

        question = Question.query.filter_by(id=question_id, quiz_id=quiz_id).first()
        if not question:
            logger.warning(f"⚠️  Question {question_id} not found in quiz {quiz_id}")
            continue

        is_correct = student_answer == question.correct_answer.strip().upper()

        if is_correct:
            correct_count += 1
        else:
            wrong_count += 1

        attempt_records.append({
            "question_id":    question_id,
            "student_answer": student_answer,
            "is_correct":     is_correct
        })

    total     = correct_count + wrong_count
    score     = round((correct_count / total) * 100) if total > 0 else 0
    xp_earned = calculate_xp(correct_count, quiz.difficulty)

    try:
        # ── SAVE SESSION ──
        session = QuizSession(
            quiz_id=quiz_id,
            user_id=user_id,
            lecture_id=lecture_id,
            score=score,
            total_questions=total,
            correct_count=correct_count,
            wrong_count=wrong_count,
            xp_earned=xp_earned,
            time_taken_seconds=time_taken
        )
        db.session.add(session)
        db.session.flush()

        # ── SAVE ATTEMPTS ──
        for attempt in attempt_records:
            qa = QuestionAttempt(
                session_id=session.id,
                question_id=attempt["question_id"],
                student_answer=attempt["student_answer"],
                is_correct=attempt["is_correct"]
            )
            db.session.add(qa)

        db.session.commit()
        logger.info(f"✅ Quiz submitted | session_id={session.id} | score={score} | xp={xp_earned}")

        return {
            "session_id":    str(session.id),
            "score":         score,
            "total":         100,
            "correct":       correct_count,
            "wrong":         wrong_count,
            "xp_earned":     xp_earned,
            "time_taken":    time_taken
        }, 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Quiz submit failed: {str(e)}")
        return {"error": "Failed to save quiz results"}, 500


# ─── 3. QUIZ HISTORY ──────────────────────────────────────

def get_quiz_history(lecture_id: str, user_id: str) -> tuple:
    logger.info(f"📋 Quiz history | lecture_id={lecture_id} | user_id={user_id}")

    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    if not lecture:
        return {"error": "Lecture not found"}, 404

    try:
        sessions = QuizSession.query.filter_by(
            lecture_id=lecture_id,
            user_id=user_id
        ).order_by(QuizSession.completed_at.desc()).all()

        attempts = []
        for s in sessions:
            quiz = Quiz.query.get(s.quiz_id)
            attempts.append({
                "session_id": str(s.id),
                "score":      s.score,
                "correct":    s.correct_count,
                "wrong":      s.wrong_count,
                "xp_earned":  s.xp_earned,
                "type":       quiz.type if quiz else "unknown",
                "difficulty": quiz.difficulty if quiz else "unknown",
                "date":       str(s.completed_at)
            })

        logger.info(f"✅ Returned {len(attempts)} quiz attempts")
        return {"lecture_id": lecture_id, "attempts": attempts}, 200

    except Exception as e:
        logger.error(f"❌ Quiz history failed: {str(e)}")
        return {"error": "Failed to fetch quiz history"}, 500
    
def get_quiz_session(session_id: str, user_id: str) -> tuple:
    logger.info(f"📋 Get session | session_id={session_id}")
    
    session = QuizSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return {"error": "Session not found"}, 404
    
    quiz = Quiz.query.get(session.quiz_id)
    attempts = QuestionAttempt.query.filter_by(session_id=session_id).all()
    
    questions = []
    for att in attempts:
        q = Question.query.get(att.question_id)
        if q:
            slide = Slide.query.get(q.slide_id) if q.slide_id else None
            questions.append({
                "question_id": str(q.id),
                "question": q.question_text,
                "options": q.options,
                "student_answer": att.student_answer,
                "correct_answer": q.correct_answer,
                "is_correct": att.is_correct,
                "slide_ref": slide.slide_number if slide else None
            })
    
    return {
        "session_id": str(session.id),
        "quiz_id": str(session.quiz_id),
        "lecture_id": str(session.lecture_id),
        "score": session.score,
        "correct": session.correct_count,
        "wrong": session.wrong_count,
        "xp_earned": session.xp_earned,
        "time_taken": session.time_taken_seconds,
        "completed_at": str(session.completed_at),
        "questions": questions
    }, 200


def delete_quiz(quiz_id: str, user_id: str) -> tuple:
    logger.info(f"🗑️  Delete quiz | quiz_id={quiz_id}")
    
    quiz = Quiz.query.filter_by(id=quiz_id, user_id=user_id).first()
    if not quiz:
        return {"error": "Quiz not found"}, 404
    
    # Check if quiz has sessions
    sessions = QuizSession.query.filter_by(quiz_id=quiz_id).count()
    if sessions > 0:
        return {"error": "Cannot delete quiz with submitted sessions"}, 400
    
    db.session.delete(quiz)
    db.session.commit()
    
    return {"message": "Quiz deleted successfully"}, 200