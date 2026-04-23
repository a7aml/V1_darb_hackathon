import logging
from flask import Blueprint, request, jsonify
from app.shared.middleware import jwt_required
from app.modules.upload.services import (
    upload_lecture,
    get_user_lectures,
    get_lecture_by_id,
    delete_lecture,
    get_lecture_slides
)

logger = logging.getLogger(__name__)
upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/lecture", methods=["POST"])
@jwt_required
def upload():
    logger.info(f"📨 POST /upload/lecture | user_id={request.user_id}")

    if not request.content_type or "multipart/form-data" not in request.content_type:
        logger.warning(f"⚠️  Wrong content type: {request.content_type}")
        return jsonify({"error": "Request must be multipart/form-data"}), 400

    title    = request.form.get("title", "").strip()
    language = request.form.get("language", "en").strip()
    file     = request.files.get("file")

    logger.debug(f"📋 Fields → title='{title}' | language='{language}' | file={file.filename if file else 'None'}")

    if not title:
        logger.warning("⚠️  Missing title field")
        return jsonify({"error": "Title is required"}), 400

    if not file:
        logger.warning("⚠️  Missing file field")
        return jsonify({"error": "File is required"}), 400

    response, status = upload_lecture(file, title, language, request.user_id)

    if status == 201:
        logger.info(f"✅ Upload successful | lecture_id={response.get('lecture_id')}")
    else:
        logger.warning(f"⚠️  Upload failed | error={response.get('error')}")

    return jsonify(response), status


@upload_bp.route("/lectures", methods=["GET"])
@jwt_required
def get_lectures():
    logger.info(f"📨 GET /upload/lectures | user_id={request.user_id}")

    response, status = get_user_lectures(request.user_id)

    if status == 200:
        logger.info(f"✅ Returned {len(response.get('lectures', []))} lectures")
    else:
        logger.warning(f"⚠️  Failed | error={response.get('error')}")

    return jsonify(response), status


@upload_bp.route("/lecture/<lecture_id>", methods=["GET"])
@jwt_required
def get_lecture(lecture_id):
    logger.info(f"📨 GET /upload/lecture/{lecture_id} | user_id={request.user_id}")

    response, status = get_lecture_by_id(lecture_id, request.user_id)

    if status == 200:
        logger.info(f"✅ Lecture returned")
    else:
        logger.warning(f"⚠️  Failed | error={response.get('error')}")

    return jsonify(response), status


@upload_bp.route("/lecture/<lecture_id>", methods=["DELETE"])
@jwt_required
def delete(lecture_id):
    logger.info(f"📨 DELETE /upload/lecture/{lecture_id} | user_id={request.user_id}")

    response, status = delete_lecture(lecture_id, request.user_id)

    if status == 200:
        logger.info(f"✅ Lecture deleted")
    else:
        logger.warning(f"⚠️  Failed | error={response.get('error')}")

    return jsonify(response), status


@upload_bp.route("/lecture/<lecture_id>/slides", methods=["GET"])
@jwt_required
def get_slides(lecture_id):
    logger.info(f"📨 GET /upload/lecture/{lecture_id}/slides | user_id={request.user_id}")

    response, status = get_lecture_slides(lecture_id, request.user_id)

    if status == 200:
        logger.info(f"✅ Slides returned")
    else:
        logger.warning(f"⚠️  Failed | error={response.get('error')}")

    return jsonify(response), status