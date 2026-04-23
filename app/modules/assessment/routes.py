import logging
from flask import Blueprint, request, jsonify
from app.shared.middleware import jwt_required
from app.modules.assessment.services import (
    get_session_result,
    get_lecture_progress,
    get_dashboard_progress
)

logger = logging.getLogger(__name__)
assessment_bp = Blueprint("assessment", __name__)


@assessment_bp.route("/result/<session_id>", methods=["GET"])
@jwt_required
def result(session_id):
    logger.info(f"📨 GET /assessment/result/{session_id}")
    response, status = get_session_result(session_id, request.user_id)
    return jsonify(response), status


@assessment_bp.route("/progress/<lecture_id>", methods=["GET"])
@jwt_required
def progress(lecture_id):
    logger.info(f"📨 GET /assessment/progress/{lecture_id}")
    response, status = get_lecture_progress(lecture_id, request.user_id)
    return jsonify(response), status


@assessment_bp.route("/dashboard", methods=["GET"])
@jwt_required
def dashboard():
    logger.info(f"📨 GET /assessment/dashboard")
    response, status = get_dashboard_progress(request.user_id)
    return jsonify(response), status