import logging
from app.extensions import db
from app.models.embedding import Embedding
from app.modules.rag.chunker import get_chunks_for_lecture
from app.modules.rag.embedder import embed_chunks

logger = logging.getLogger(__name__)


def process_lecture_embeddings(lecture_id: str) -> dict:
    """
    Main RAG pipeline.
    Called automatically after lecture upload.
    Steps:
    1. Get chunks from DB (chunker)
    2. Embed each chunk (embedder)
    3. Save embeddings to pgvector (DB)
    """
    logger.info(f"🚀 Starting RAG pipeline for lecture_id={lecture_id}")

    # ── STEP 1: Get chunks ──
    try:
        chunks = get_chunks_for_lecture(lecture_id)
        if not chunks:
            logger.warning(f"⚠️  No chunks found for lecture_id={lecture_id}. Skipping RAG.")
            return {"success": False, "reason": "No chunks found"}
        logger.info(f"✅ Got {len(chunks)} chunks from chunker")
    except Exception as e:
        logger.error(f"❌ Chunker failed: {str(e)}")
        return {"success": False, "reason": str(e)}

    # ── STEP 2: Embed chunks ──
    try:
        embedded_chunks = embed_chunks(chunks)
        if not embedded_chunks:
            logger.error(f"❌ No chunks were embedded successfully")
            return {"success": False, "reason": "Embedding failed for all chunks"}
        logger.info(f"✅ Embedded {len(embedded_chunks)} chunks")
    except Exception as e:
        logger.error(f"❌ Embedder failed: {str(e)}")
        return {"success": False, "reason": str(e)}

    # ── STEP 3: Save embeddings to DB ──
    try:
        logger.info(f"💾 Saving {len(embedded_chunks)} embeddings to pgvector...")

        # Delete old embeddings for this lecture if re-uploading
        Embedding.query.filter_by(lecture_id=lecture_id).delete()

        for chunk in embedded_chunks:
            embedding_record = Embedding(
                slide_id=chunk["slide_id"],
                lecture_id=chunk["lecture_id"],
                embedding=chunk["embedding"]
            )
            db.session.add(embedding_record)

        db.session.commit()
        logger.info(f"✅ RAG pipeline complete | lecture_id={lecture_id} | embeddings saved={len(embedded_chunks)}")

        return {
            "success": True,
            "lecture_id": lecture_id,
            "embeddings_saved": len(embedded_chunks)
        }

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to save embeddings to DB: {str(e)}")
        return {"success": False, "reason": str(e)}