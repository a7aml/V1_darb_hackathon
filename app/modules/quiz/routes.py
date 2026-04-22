import logging
from flask import Blueprint, request, jsonify
from app.shared.middleware import jwt_required
from app.modules.quiz.services import generate_quiz, submit_quiz, get_quiz_history

logger = logging.getLogger(__name__)

quiz_bp = Blueprint("quiz", __name__)


# ─── 1. GENERATE QUIZ ─────────────────────────────────────

@quiz_bp.route("/generate", methods=["POST"])
@jwt_required
def generate():
    logger.info(f"📨 POST /quiz/generate | user_id={request.user_id}")

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    lecture_id    = data.get("lecture_id", "").strip()
    quiz_type     = data.get("type", "").strip()
    difficulty    = data.get("difficulty", "").strip()
    num_questions = data.get("num_questions", 0)
    slide_number  = data.get("slide_number", None)

    # ── VALIDATIONS ──
    if not lecture_id:
        return jsonify({"error": "lecture_id is required"}), 400

    if not quiz_type:
        return jsonify({"error": "type is required"}), 400

    if not difficulty:
        return jsonify({"error": "difficulty is required"}), 400

    if not num_questions or not isinstance(num_questions, int):
        return jsonify({"error": "num_questions must be an integer"}), 400

    logger.debug(f"📋 Generate | type={quiz_type} | difficulty={difficulty} | num={num_questions} | slide={slide_number}")

    response, status = generate_quiz(
        lecture_id=lecture_id,
        user_id=request.user_id,
        quiz_type=quiz_type,
        difficulty=difficulty,
        num_questions=num_questions,
        slide_number=slide_number
    )

    if status == 201:
        logger.info(f"✅ Quiz generated | quiz_id={response.get('quiz_id')}")
    else:
        logger.warning(f"⚠️  Quiz generation failed | error={response.get('error')}")

    return jsonify(response), status


# ─── 2. SUBMIT QUIZ ───────────────────────────────────────

@quiz_bp.route("/submit", methods=["POST"])
@jwt_required
def submit():
    logger.info(f"📨 POST /quiz/submit | user_id={request.user_id}")

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    quiz_id    = data.get("quiz_id", "").strip()
    lecture_id = data.get("lecture_id", "").strip()
    time_taken = data.get("time_taken", 0)
    answers    = data.get("answers", [])

    # ── VALIDATIONS ──
    if not quiz_id:
        return jsonify({"error": "quiz_id is required"}), 400

    if not lecture_id:
        return jsonify({"error": "lecture_id is required"}), 400

    if not answers:
        return jsonify({"error": "answers are required"}), 400

    if not isinstance(answers, list):
        return jsonify({"error": "answers must be a list"}), 400

    logger.debug(f"📋 Submit | quiz_id={quiz_id} | answers={len(answers)}")

    response, status = submit_quiz(
        quiz_id=quiz_id,
        lecture_id=lecture_id,
        user_id=request.user_id,
        time_taken=time_taken,
        answers=answers
    )

    if status == 200:
        logger.info(f"✅ Quiz submitted | session_id={response.get('session_id')} | score={response.get('score')}")
    else:
        logger.warning(f"⚠️  Quiz submit failed | error={response.get('error')}")

    return jsonify(response), status


# ─── 3. QUIZ HISTORY ──────────────────────────────────────

@quiz_bp.route("/history/<lecture_id>", methods=["GET"])
@jwt_required
def history(lecture_id):
    logger.info(f"📨 GET /quiz/history/{lecture_id} | user_id={request.user_id}")

    if not lecture_id:
        return jsonify({"error": "lecture_id is required"}), 400

    response, status = get_quiz_history(
        lecture_id=lecture_id,
        user_id=request.user_id
    )

    if status == 200:
        logger.info(f"✅ History returned | attempts={len(response.get('attempts', []))}")
    else:
        logger.warning(f"⚠️  History failed | error={response.get('error')}")

    return jsonify(response), status