from flask import Blueprint, jsonify
from app.extensions import db
from sqlalchemy import text

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Server is running"
    }), 200

@health_bp.route('/health/db', methods=['GET'])
def db_health_check():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({
            "status": "ok",
            "message": "Database connected successfully",
            "database": "Supabase PostgreSQL"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Database connection failed",
            "error": str(e)
        }), 500

