import jwt
import datetime
import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.models.users import User
from app.extensions import db


SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def generate_token(user_id) -> str:
    payload = {
        "user_id": str(user_id),  # ← add str() here
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])


# ─── LOCAL AUTH ───────────────────────────────────────────

def signup_user(email: str, password: str, full_name: str) -> dict:
    existing = User.query.filter_by(email=email).first()
    if existing:
        return {"error": "Email already registered"}, 400

    user = User(
        email=email,
        full_name=full_name,
        auth_provider="local"
    )
    user.set_password(password)  # ← moved outside constructor
    db.session.add(user)
    db.session.commit()

    return {"message": "Account created successfully", "user_id": user.id}, 201


def login_user(email: str, password: str) -> dict:
    user = User.query.filter_by(email=email, auth_provider="local").first()

    if not user or not user.check_password(password):  # ← use model method
        return {"error": "Invalid email or password"}, 401

    token = generate_token(user.id)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    }, 200


# ─── GOOGLE AUTH ──────────────────────────────────────────

def google_auth(google_token: str) -> dict:
    try:
        id_info = id_token.verify_oauth2_token(
            google_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = id_info.get("email")
        full_name = id_info.get("name", "")

        if not email:
            return {"error": "Google token invalid"}, 400

        user = User.query.filter_by(email=email).first()

        if not user:
            user = User(
                email=email,
                full_name=full_name,
                auth_provider="google"
            )
            # no set_password → google user has no password
            db.session.add(user)
            db.session.commit()

        token = generate_token(user.id)
        return {
            "token": token,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email
            }
        }, 200

    except ValueError:
        return {"error": "Invalid Google token"}, 401


# ─── GET CURRENT USER ─────────────────────────────────────

def get_current_user(user_id: str) -> dict:
    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found"}, 404

    return {"user": user.to_dict()}, 200


def update_profile(user_id: str, full_name: str) -> tuple:
    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found"}, 404
    
    user.full_name = full_name
    db.session.commit()
    
    return {
        "message": "Profile updated successfully",
        "user": user.to_dict()
    }, 200


def change_password(user_id: str, old_password: str, new_password: str) -> tuple:
    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found"}, 404
    
    if not user.check_password(old_password):
        return {"error": "Old password is incorrect"}, 400
    
    user.set_password(new_password)
    db.session.commit()
    
    return {"message": "Password changed successfully"}, 200