import logging
from flask import Blueprint, request, jsonify
from app.shared.middleware import jwt_required
from app.modules.auth.services import (
    signup_user,
    login_user,
    google_auth,
    get_current_user,
    update_profile,
    change_password
)

logger = logging.getLogger(__name__)
auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    logger.info("📨 POST /auth/signup")
    data = request.get_json()

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    full_name = data.get("full_name", "").strip()

    if not email or not password or not full_name:
        return jsonify({"error": "All fields are required"}), 400

    response, status = signup_user(email, password, full_name)
    return jsonify(response), status


@auth_bp.route("/login", methods=["POST"])
def login():
    logger.info("📨 POST /auth/login")
    data = request.get_json()

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    response, status = login_user(email, password)
    return jsonify(response), status


@auth_bp.route("/google", methods=["POST"])
def google():
    logger.info("📨 POST /auth/google")
    data = request.get_json()

    google_token = data.get("google_token", "").strip()

    if not google_token:
        return jsonify({"error": "Google token is required"}), 400

    response, status = google_auth(google_token)
    return jsonify(response), status


@auth_bp.route("/me", methods=["GET"])
@jwt_required
def me():
    logger.info(f"📨 GET /auth/me | user_id={request.user_id}")
    response, status = get_current_user(request.user_id)
    return jsonify(response), status


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required
def profile():
    logger.info(f"📨 PUT /auth/profile | user_id={request.user_id}")
    data = request.get_json()

    full_name = data.get("full_name", "").strip()

    if not full_name:
        return jsonify({"error": "full_name is required"}), 400

    response, status = update_profile(request.user_id, full_name)
    return jsonify(response), status


@auth_bp.route("/password", methods=["PUT"])
@jwt_required
def password():
    logger.info(f"📨 PUT /auth/password | user_id={request.user_id}")
    
    # Check if user is Google account
    from app.models.users import User
    user = User.query.get(request.user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.is_google_account:
        return jsonify({"error": "Cannot change password for Google accounts"}), 403
    
    data = request.get_json()

    old_password = data.get("old_password", "").strip()
    new_password = data.get("new_password", "").strip()

    if not old_password or not new_password:
        return jsonify({"error": "Both old_password and new_password are required"}), 400

    response, status = change_password(request.user_id, old_password, new_password)
    return jsonify(response), status