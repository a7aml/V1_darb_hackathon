from flask import Blueprint, request, jsonify
from app.modules.auth.services import (
    signup_user,
    login_user,
    google_auth,
    get_current_user,
    decode_token
)

auth_bp = Blueprint("auth", __name__)


# ─── SIGNUP ───────────────────────────────────────────────

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    full_name = data.get("full_name", "").strip()

    if not email or not password or not full_name:
        return jsonify({"error": "All fields are required"}), 400

    response, status = signup_user(email, password, full_name)
    return jsonify(response), status


# ─── LOGIN ────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    response, status = login_user(email, password)
    return jsonify(response), status


# ─── GOOGLE AUTH ──────────────────────────────────────────

@auth_bp.route("/google", methods=["POST"])
def google():
    data = request.get_json()

    google_token = data.get("google_token", "").strip()

    if not google_token:
        return jsonify({"error": "Google token is required"}), 400

    response, status = google_auth(google_token)
    return jsonify(response), status


# ─── GET CURRENT USER ─────────────────────────────────────

@auth_bp.route("/me", methods=["GET"])
def me():
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Token missing"}), 401

    token = auth_header.split(" ")[1]

    try:
        payload = decode_token(token)
        user_id = payload.get("user_id")
        response, status = get_current_user(user_id)
        return jsonify(response), status

    except Exception:
        return jsonify({"error": "Invalid or expired token"}), 401