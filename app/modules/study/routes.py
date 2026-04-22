import logging
from flask import Blueprint, request, jsonify
from app.shared.middleware import jwt_required
from app.modules.study.services import (
    get_summary,
    explain_slide,
    get_flashcards,
    get_mindmap,
    get_glossary,
    get_tldr
)

logger = logging.getLogger(__name__)

study_bp = Blueprint("study", __name__)


# ─── 1. SUMMARY ───────────────────────────────────────────

@study_bp.route("/summary/<lecture_id>", methods=["GET"])
@jwt_required
def summary(lecture_id):
    logger.info(f"📨 GET /study/summary/{lecture_id} | user_id={request.user_id}")

    if not lecture_id:
        return jsonify({"error": "lecture_id is required"}), 400

    response, status = get_summary(lecture_id, request.user_id)

    if status == 200:
        logger.info(f"✅ Summary returned | lecture_id={lecture_id}")
    else:
        logger.warning(f"⚠️  Summary failed | error={response.get('error')}")

    return jsonify(response), status


# ─── 2. EXPLAIN SLIDE ─────────────────────────────────────

@study_bp.route("/explain/<lecture_id>/<int:slide_number>", methods=["GET"])
@jwt_required
def explain(lecture_id, slide_number):
    logger.info(f"📨 GET /study/explain/{lecture_id}/{slide_number} | user_id={request.user_id}")

    if slide_number < 1:
        return jsonify({"error": "slide_number must be greater than 0"}), 400

    response, status = explain_slide(lecture_id, slide_number, request.user_id)

    if status == 200:
        logger.info(f"✅ Explanation returned | slide={slide_number}")
    else:
        logger.warning(f"⚠️  Explanation failed | error={response.get('error')}")

    return jsonify(response), status


# ─── 3. FLASHCARDS ────────────────────────────────────────

@study_bp.route("/flashcards/<lecture_id>", methods=["GET"])
@jwt_required
def flashcards(lecture_id):
    logger.info(f"📨 GET /study/flashcards/{lecture_id} | user_id={request.user_id}")

    response, status = get_flashcards(lecture_id, request.user_id)

    if status == 200:
        logger.info(f"✅ Flashcards returned | lecture_id={lecture_id}")
    else:
        logger.warning(f"⚠️  Flashcards failed | error={response.get('error')}")

    return jsonify(response), status


# ─── 4. MIND MAP ──────────────────────────────────────────

@study_bp.route("/mindmap/<lecture_id>", methods=["GET"])
@jwt_required
def mindmap(lecture_id):
    logger.info(f"📨 GET /study/mindmap/{lecture_id} | user_id={request.user_id}")

    response, status = get_mindmap(lecture_id, request.user_id)

    if status == 200:
        logger.info(f"✅ Mind map returned | lecture_id={lecture_id}")
    else:
        logger.warning(f"⚠️  Mind map failed | error={response.get('error')}")

    return jsonify(response), status


# ─── 5. GLOSSARY ──────────────────────────────────────────

@study_bp.route("/glossary/<lecture_id>", methods=["GET"])
@jwt_required
def glossary(lecture_id):
    logger.info(f"📨 GET /study/glossary/{lecture_id} | user_id={request.user_id}")

    response, status = get_glossary(lecture_id, request.user_id)

    if status == 200:
        logger.info(f"✅ Glossary returned | lecture_id={lecture_id}")
    else:
        logger.warning(f"⚠️  Glossary failed | error={response.get('error')}")

    return jsonify(response), status


# ─── 6. TL;DR ─────────────────────────────────────────────

@study_bp.route("/tldr/<lecture_id>/<int:slide_number>", methods=["GET"])
@jwt_required
def tldr(lecture_id, slide_number):
    logger.info(f"📨 GET /study/tldr/{lecture_id}/{slide_number} | user_id={request.user_id}")

    if slide_number < 1:
        return jsonify({"error": "slide_number must be greater than 0"}), 400

    response, status = get_tldr(lecture_id, slide_number, request.user_id)

    if status == 200:
        logger.info(f"✅ TLDR returned | slide={slide_number}")
    else:
        logger.warning(f"⚠️  TLDR failed | error={response.get('error')}")

    return jsonify(response), status