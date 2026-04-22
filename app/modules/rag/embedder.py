import time
import logging
from app.shared.openai_client import embed

logger = logging.getLogger(__name__)

# ─── CONSTANTS ────────────────────────────────────────────
RATE_LIMIT_DELAY = 0.5  # seconds between each embedding call


def embed_chunks(chunks: list) -> list:
    """
    Takes list of chunks from chunker.
    Sends each chunk content to Gemini embedding API.
    Returns list of chunks with embedding vectors added.
    """
    logger.info(f"🔢 Starting embedding for {len(chunks)} chunks")

    embedded_chunks = []

    for i, chunk in enumerate(chunks):
        try:
            logger.debug(f"🔄 Embedding chunk {i+1}/{len(chunks)} | slide={chunk['slide_number']}")

            # ── Send to Gemini ──
            vector = embed(chunk["content"])

            # ── Add vector to chunk ──
            embedded_chunks.append({
                "slide_id":     chunk["slide_id"],
                "lecture_id":   chunk["lecture_id"],
                "slide_number": chunk["slide_number"],
                "content":      chunk["content"],
                "embedding":    vector
            })

            logger.debug(f"✅ Chunk {i+1} embedded | vector size={len(vector)}")

            # ── Rate limit: avoid hitting Gemini too fast ──
            time.sleep(RATE_LIMIT_DELAY)

        except Exception as e:
            logger.error(f"❌ Failed to embed chunk {i+1} slide={chunk['slide_number']}: {str(e)}")
            # Skip failed chunk and continue with rest
            continue

    logger.info(f"✅ Embedding complete | {len(embedded_chunks)}/{len(chunks)} chunks embedded")
    return embedded_chunks