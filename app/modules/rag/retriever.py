import logging
from sqlalchemy import text
from app.extensions import db
from app.shared.openai_client import embed_query

logger = logging.getLogger(__name__)

# ─── CONSTANTS ────────────────────────────────────────────
DEFAULT_TOP_K = 3  # number of chunks to return


def retrieve_relevant_chunks(query: str, lecture_id: str, top_k: int = DEFAULT_TOP_K) -> list:
    """
    Takes a student question + lecture_id.
    Embeds the question.
    Searches pgvector for most similar slide chunks.
    Returns top K chunks with slide content.
    """
    logger.info(f"🔍 Retrieving chunks | lecture_id={lecture_id} | top_k={top_k}")
    logger.debug(f"📝 Query: {query[:100]}")

    # ── STEP 1: Embed the query ──
    try:
        query_vector = embed_query(query)
        logger.debug(f"✅ Query embedded | vector size={len(query_vector)}")
    except Exception as e:
        logger.error(f"❌ Failed to embed query: {str(e)}")
        raise Exception(f"Failed to embed query: {str(e)}")

    # ── STEP 2: Search pgvector ──
    try:
        # Convert vector to string format for pgvector
        vector_str = "[" + ",".join(map(str, query_vector)) + "]"

        sql = text("""
            SELECT
                e.slide_id,
                e.lecture_id,
                s.slide_number,
                s.content,
                1 - (e.embedding <=> :query_vector ::vector) AS similarity
            FROM embeddings e
            JOIN slides s ON s.id = e.slide_id
            WHERE e.lecture_id = :lecture_id
            ORDER BY e.embedding <=> :query_vector ::vector
            LIMIT :top_k
        """)

        results = db.session.execute(sql, {
            "query_vector": vector_str,
            "lecture_id":   lecture_id,
            "top_k":        top_k
        }).fetchall()

        if not results:
            logger.warning(f"⚠️  No results found for query in lecture_id={lecture_id}")
            return []

        chunks = []
        for row in results:
            chunks.append({
                "slide_id":     str(row.slide_id),
                "lecture_id":   str(row.lecture_id),
                "slide_number": row.slide_number,
                "content":      row.content,
                "similarity":   round(float(row.similarity), 4)
            })
            logger.debug(f"   → Slide {row.slide_number} | similarity={round(float(row.similarity), 4)}")

        logger.info(f"✅ Retrieved {len(chunks)} relevant chunks")
        return chunks

    except Exception as e:
        logger.error(f"❌ pgvector search failed: {str(e)}")
        raise Exception(f"Retrieval failed: {str(e)}")