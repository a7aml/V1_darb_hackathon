import logging
from flask import Blueprint, request, jsonify
from app.shared.middleware import jwt_required
from app.modules.chatbot.services import ask_question

logger = logging.getLogger(__name__)
chatbot_bp = Blueprint("chatbot", __name__)


@chatbot_bp.route("/ask", methods=["POST"])
@jwt_required
def ask():
    logger.info(f"📨 POST /chatbot/ask | user_id={request.user_id}")

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    lecture_id = data.get("lecture_id", "").strip()
    message = data.get("message", "").strip()

    if not lecture_id:
        return jsonify({"error": "lecture_id required"}), 400

    if not message:
        return jsonify({"error": "message required"}), 400

    response, status = ask_question(lecture_id, request.user_id, message)

    if status == 200:
        logger.info(f"✅ Answer returned")
    else:
        logger.warning(f"⚠️  Failed | error={response.get('error')}")

    return jsonify(response), status