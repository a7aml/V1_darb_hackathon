import os
import uuid
import tempfile
import logging
import requests as http
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.lectures import Lecture, Slide
from app.modules.upload.slide_detector import extract_slides
from app.modules.rag.services import process_lecture_embeddings


# ─── LOGGER SETUP ─────────────────────────────────────────
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s → %(message)s"
)

# ─── SUPABASE CONFIG ──────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME  = "lectures"

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.critical("❌ SUPABASE_URL or SUPABASE_KEY missing from .env")
    raise EnvironmentError("Supabase credentials not found in environment variables.")

logger.info("✅ Supabase config loaded")

# ─── CONSTANTS ────────────────────────────────────────────
ALLOWED_EXTENSIONS  = {".pdf", ".docx", ".doc"}
MAX_FILE_SIZE_MB    = 20
MIN_SLIDES_REQUIRED = 1


# ─── SUPABASE STORAGE HELPERS ─────────────────────────────

def supabase_upload_file(storage_path: str, file_bytes: bytes, content_type: str) -> bool:
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": content_type
    }
    try:
        response = http.post(url, headers=headers, data=file_bytes)
        logger.debug(f"☁️  Supabase upload response: {response.status_code} | {response.text}")
        return response.status_code in [200, 201]
    except Exception as e:
        logger.error(f"❌ Supabase upload request failed: {str(e)}")
        return False


def supabase_get_public_url(storage_path: str) -> str:
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"


# ─── HELPERS ──────────────────────────────────────────────

def get_file_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()


def get_content_type(ext: str) -> str:
    types = {
        ".pdf":  "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".doc":  "application/msword"
    }
    return types.get(ext, "application/octet-stream")


# ─── UPLOAD LECTURE ───────────────────────────────────────

def upload_lecture(file, title: str, language: str, user_id: str) -> tuple:
    logger.info(f"📥 Upload request from user_id={user_id}")

    # ── CHECK 1: File exists ──
    if not file or file.filename == "":
        logger.warning("⚠️  No file provided in request")
        return {"error": "No file provided"}, 400

    filename = secure_filename(file.filename)
    ext      = get_file_extension(filename)
    logger.debug(f"📄 File received: {filename} | Extension: {ext}")

    # ── CHECK 2: File extension ──
    if ext not in ALLOWED_EXTENSIONS:
        logger.warning(f"⚠️  Rejected file extension: {ext}")
        return {"error": f"Invalid file type '{ext}'. Only PDF, DOCX, DOC allowed."}, 400

    # ── CHECK 3: Title ──
    if not title or len(title.strip()) < 2:
        logger.warning("⚠️  Title missing or too short")
        return {"error": "Title must be at least 2 characters"}, 400

    if len(title) > 255:
        logger.warning(f"⚠️  Title too long: {len(title)} chars")
        return {"error": "Title must be under 255 characters"}, 400

    # ── CHECK 4: Language ──
    if language not in ["en", "ar"]:
        logger.warning(f"⚠️  Invalid language value: {language}")
        return {"error": "Language must be 'en' or 'ar'"}, 400

    # ── Save file temporarily ──
    tmp_dir  = tempfile.mkdtemp()
    tmp_path = os.path.join(tmp_dir, filename)

    try:
        file.save(tmp_path)
        logger.debug(f"💾 File saved temporarily at: {tmp_path}")
    except Exception as e:
        logger.error(f"❌ Failed to save temp file: {str(e)}")
        return {"error": "Failed to process uploaded file"}, 500

    # ── CHECK 5: File size ──
    file_size_mb = os.path.getsize(tmp_path) / (1024 * 1024)
    logger.debug(f"📦 File size: {file_size_mb:.2f} MB")

    if file_size_mb > MAX_FILE_SIZE_MB:
        os.remove(tmp_path)
        logger.warning(f"⚠️  File too large: {file_size_mb:.2f}MB > {MAX_FILE_SIZE_MB}MB limit")
        return {"error": f"File too large. Max allowed is {MAX_FILE_SIZE_MB}MB. Your file is {file_size_mb:.1f}MB."}, 400

    if file_size_mb == 0:
        os.remove(tmp_path)
        logger.warning("⚠️  File is empty (0 bytes)")
        return {"error": "File is empty"}, 400

    try:
        # ── STEP 1: Extract slides ──
        logger.info(f"🔍 Extracting slides from {ext} file...")
        try:
            slides_data = extract_slides(tmp_path, ext)
            logger.info(f"✅ Extracted {len(slides_data)} slides")
        except ValueError as e:
            logger.error(f"❌ Slide extraction ValueError: {str(e)}")
            return {"error": str(e)}, 422
        except Exception as e:
            logger.error(f"❌ Unexpected error during slide extraction: {str(e)}")
            return {"error": "Failed to read file content. File may be corrupted or password protected."}, 422

        # ── CHECK 6: At least one slide extracted ──
        if not slides_data or len(slides_data) < MIN_SLIDES_REQUIRED:
            logger.warning("⚠️  No slides could be extracted from file")
            return {"error": "Could not detect any content in the file. Make sure the file is not empty or password protected."}, 422

        # ── CHECK 7: Filter empty slide content ──
        valid_slides = [s for s in slides_data if s["content"].strip()]
        if len(valid_slides) == 0:
            logger.warning("⚠️  All extracted slides have empty content")
            return {"error": "File was processed but all slides appear to be empty."}, 422

        logger.debug(f"✅ Valid slides after content check: {len(valid_slides)}")

        # ── STEP 2: Upload to Supabase Storage via REST ──
        storage_filename = f"{user_id}/{uuid.uuid4()}{ext}"
        logger.info(f"☁️  Uploading to Supabase storage: bucket={BUCKET_NAME} path={storage_filename}")

        with open(tmp_path, "rb") as f:
            file_bytes = f.read()

        success = supabase_upload_file(storage_filename, file_bytes, get_content_type(ext))

        if not success:
            logger.error("❌ Supabase storage upload failed")
            return {"error": "Failed to upload file to storage. Please try again."}, 500

        logger.info("✅ File successfully uploaded to Supabase storage")

        # ── Get public URL ──
        file_url = supabase_get_public_url(storage_filename)
        logger.debug(f"🔗 Public file URL: {file_url}")

        # ── STEP 3: Save lecture record to DB ──
        logger.info("💾 Saving lecture record to database...")
        try:
            lecture = Lecture(
                user_id=user_id,
                title=title.strip(),
                file_url=file_url,
                language=language,
                total_slides=len(valid_slides)
            )
            db.session.add(lecture)
            db.session.flush()
            logger.debug(f"✅ Lecture record created | id={lecture.id} | slides={len(valid_slides)}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"❌ Failed to save lecture to DB: {str(e)}")
            return {"error": "Failed to save lecture record to database."}, 500

        # ── STEP 4: Save slides to DB ──
        logger.info(f"💾 Saving {len(valid_slides)} slides to database...")
        try:
            for slide_data in valid_slides:
                slide = Slide(
                    lecture_id=lecture.id,
                    slide_number=slide_data["slide_number"],
                    content=slide_data["content"]
                )
                db.session.add(slide)

            db.session.commit()
            logger.info(f"✅ Slides saved | lecture_id={lecture.id} | total_slides={len(valid_slides)}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"❌ Failed to save slides to DB: {str(e)}")
            return {"error": "Lecture saved but failed to save slide content."}, 500

        # ── STEP 5: Trigger RAG pipeline ──
        logger.info("🚀 Triggering RAG pipeline...")
        try:
            rag_result = process_lecture_embeddings(str(lecture.id))
            if rag_result["success"]:
                logger.info(f"✅ RAG pipeline complete | embeddings={rag_result['embeddings_saved']}")
            else:
                logger.warning(f"⚠️  RAG pipeline failed: {rag_result['reason']}")
        except Exception as e:
            # RAG failure should NOT fail the upload
            logger.error(f"❌ RAG pipeline exception: {str(e)}")

        return {
            "message": "Lecture uploaded and processed successfully",
            "lecture_id": str(lecture.id),
            "total_slides": len(valid_slides)
        }, 201

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            logger.debug(f"🧹 Temp file removed: {tmp_path}")


# ─── GET ALL LECTURES ─────────────────────────────────────

def get_user_lectures(user_id: str) -> tuple:
    logger.info(f"📋 Fetching all lectures for user_id={user_id}")

    if not user_id:
        logger.warning("⚠️  Missing user_id in get_user_lectures")
        return {"error": "Unauthorized"}, 401

    try:
        lectures = Lecture.query.filter_by(user_id=user_id).order_by(
            Lecture.created_at.desc()
        ).all()

        logger.info(f"✅ Returned {len(lectures)} lectures for user_id={user_id}")

        return {"lectures": [l.to_dict() for l in lectures]}, 200

    except Exception as e:
        logger.error(f"❌ DB error fetching lectures for user_id={user_id}: {str(e)}")
        return {"error": "Failed to fetch lectures. Please try again."}, 500
    
    
def get_lecture_by_id(lecture_id: str, user_id: str) -> tuple:
    logger.info(f"📖 Get lecture | lecture_id={lecture_id}")
    
    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    if not lecture:
        return {"error": "Lecture not found"}, 404
    
    slides = Slide.query.filter_by(lecture_id=lecture_id).order_by(Slide.slide_number).all()
    
    result = lecture.to_dict()
    result["slides"] = [{"id": str(s.id), "slide_number": s.slide_number, "content": s.content} for s in slides]
    
    return result, 200


def delete_lecture(lecture_id: str, user_id: str) -> tuple:
    logger.info(f"🗑️  Delete lecture | lecture_id={lecture_id}")
    
    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    if not lecture:
        return {"error": "Lecture not found"}, 404
    
    db.session.delete(lecture)
    db.session.commit()
    
    return {"message": "Lecture deleted successfully"}, 200


def get_lecture_slides(lecture_id: str, user_id: str) -> tuple:
    logger.info(f"📄 Get slides | lecture_id={lecture_id}")
    
    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    if not lecture:
        return {"error": "Lecture not found"}, 404
    
    slides = Slide.query.filter_by(lecture_id=lecture_id).order_by(Slide.slide_number).all()
    
    return {
        "lecture_id": lecture_id,
        "slides": [{"id": str(s.id), "slide_number": s.slide_number, "content": s.content} for s in slides]
    }, 200