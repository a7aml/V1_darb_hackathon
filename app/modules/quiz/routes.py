import logging
from flask import Blueprint, request, jsonify
from app.shared.middleware import jwt_required
from app.modules.quiz.services import (
    generate_quiz,
    submit_quiz,
    get_quiz_history,
    get_quiz_session,
    delete_quiz
)

logger = logging.getLogger(__name__)
quiz_bp = Blueprint("quiz", __name__)


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

    if not lecture_id:
        return jsonify({"error": "lecture_id is required"}), 400
    if not quiz_type:
        return jsonify({"error": "type is required"}), 400
    if not difficulty:
        return jsonify({"error": "difficulty is required"}), 400
    if not num_questions or not isinstance(num_questions, int):
        return jsonify({"error": "num_questions must be an integer"}), 400

    response, status = generate_quiz(lecture_id, request.user_id, quiz_type, difficulty, num_questions, slide_number)

    if status == 201:
        logger.info(f"✅ Quiz generated | quiz_id={response.get('quiz_id')}")
    else:
        logger.warning(f"⚠️  Failed | error={response.get('error')}")

    return jsonify(response), status


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

    if not quiz_id:
        return jsonify({"error": "quiz_id is required"}), 400
    if not lecture_id:
        return jsonify({"error": "lecture_id is required"}), 400
    if not answers or not isinstance(answers, list):
        return jsonify({"error": "answers are required"}), 400

    response, status = submit_quiz(quiz_id, lecture_id, request.user_id, time_taken, answers)

    if status == 200:
        logger.info(f"✅ Submitted | score={response.get('score')}")
    else:
        logger.warning(f"⚠️  Failed | error={response.get('error')}")

    return jsonify(response), status


@quiz_bp.route("/history/<lecture_id>", methods=["GET"])
@jwt_required
def history(lecture_id):
    logger.info(f"📨 GET /quiz/history/{lecture_id} | user_id={request.user_id}")

    response, status = get_quiz_history(lecture_id, request.user_id)

    if status == 200:
        logger.info(f"✅ History returned")
    else:
        logger.warning(f"⚠️  Failed | error={response.get('error')}")

    return jsonify(response), status


@quiz_bp.route("/session/<session_id>", methods=["GET"])
@jwt_required
def session(session_id):
    logger.info(f"📨 GET /quiz/session/{session_id} | user_id={request.user_id}")

    response, status = get_quiz_session(session_id, request.user_id)

    if status == 200:
        logger.info(f"✅ Session returned")
    else:
        logger.warning(f"⚠️  Failed | error={response.get('error')}")

    return jsonify(response), status


@quiz_bp.route("/<quiz_id>", methods=["DELETE"])
@jwt_required
def delete(quiz_id):
    logger.info(f"📨 DELETE /quiz/{quiz_id} | user_id={request.user_id}")

    response, status = delete_quiz(quiz_id, request.user_id)

    if status == 200:
        logger.info(f"✅ Quiz deleted")
    else:
        logger.warning(f"⚠️  Failed | error={response.get('error')}")

    return jsonify(response), status