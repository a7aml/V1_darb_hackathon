import logging
from app.models.lectures import Slide

logger = logging.getLogger(__name__)


def get_chunks_for_lecture(lecture_id: str) -> list:
    """
    Reads all slides for a lecture from DB.
    Returns list of chunks ready for embedding.
    Each chunk = one slide.
    """
    logger.info(f"📦 Fetching chunks for lecture_id={lecture_id}")

    try:
        slides = Slide.query.filter_by(
            lecture_id=lecture_id
        ).order_by(Slide.slide_number).all()

        if not slides:
            logger.warning(f"⚠️  No slides found for lecture_id={lecture_id}")
            return []

        chunks = []
        for slide in slides:
            # Skip empty slides
            if not slide.content or not slide.content.strip():
                logger.warning(f"⚠️  Skipping empty slide {slide.slide_number}")
                continue

            chunks.append({
                "slide_id":     str(slide.id),
                "lecture_id":   str(slide.lecture_id),
                "slide_number": slide.slide_number,
                "content":      slide.content.strip()
            })

        logger.info(f"✅ Prepared {len(chunks)} chunks for lecture_id={lecture_id}")
        return chunks

    except Exception as e:
        logger.error(f"❌ Chunker failed for lecture_id={lecture_id}: {str(e)}")
        raise Exception(f"Failed to fetch chunks: {str(e)}")