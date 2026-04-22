import logging
from flask import Blueprint, request, jsonify
from app.shared.middleware import jwt_required
from app.modules.upload.services import upload_lecture, get_user_lectures

logger = logging.getLogger(__name__)

upload_bp = Blueprint("upload", __name__)


# ─── UPLOAD LECTURE ───────────────────────────────────────

@upload_bp.route("/lecture", methods=["POST"])
@jwt_required
def upload():
    logger.info(f"📨 POST /upload/lecture | user_id={request.user_id}")

    # ── CHECK: Content type ──
    if not request.content_type or "multipart/form-data" not in request.content_type:
        logger.warning(f"⚠️  Wrong content type: {request.content_type}")
        return jsonify({"error": "Request must be multipart/form-data"}), 400

    # ── Get fields ──
    title    = request.form.get("title", "").strip()
    language = request.form.get("language", "en").strip()
    file     = request.files.get("file")

    logger.debug(f"📋 Fields → title='{title}' | language='{language}' | file={file.filename if file else 'None'}")

    # ── CHECK: Required fields ──
    if not title:
        logger.warning("⚠️  Missing title field")
        return jsonify({"error": "Title is required"}), 400

    if not file:
        logger.warning("⚠️  Missing file field")
        return jsonify({"error": "File is required"}), 400

    response, status = upload_lecture(
        file=file,
        title=title,
        language=language,
        user_id=request.user_id
    )

    if status == 201:
        logger.info(f"✅ Upload successful | lecture_id={response.get('lecture_id')}")
    else:
        logger.warning(f"⚠️  Upload failed | status={status} | error={response.get('error')}")

    return jsonify(response), status


# ─── GET ALL LECTURES ─────────────────────────────────────

@upload_bp.route("/lectures", methods=["GET"])
@jwt_required
def get_lectures():
    logger.info(f"📨 GET /upload/lectures | user_id={request.user_id}")

    response, status = get_user_lectures(user_id=request.user_id)

    if status == 200:
        count = len(response.get("lectures", []))
        logger.info(f"✅ Returned {count} lectures for user_id={request.user_id}")
    else:
        logger.warning(f"⚠️  Failed to fetch lectures | error={response.get('error')}")

    return jsonify(response), status