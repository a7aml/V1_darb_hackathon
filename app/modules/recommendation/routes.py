import logging
from flask import Blueprint, request, jsonify
from app.shared.middleware import jwt_required
from app.modules.recommendation.services import get_recommendations

logger = logging.getLogger(__name__)
recommendation_bp = Blueprint("recommendation", __name__)


@recommendation_bp.route("/<lecture_id>", methods=["GET"])
@jwt_required
def recommend(lecture_id):
    logger.info(f"📨 GET /recommendation/{lecture_id}")
    response, status = get_recommendations(lecture_id, request.user_id)
    return jsonify(response), status