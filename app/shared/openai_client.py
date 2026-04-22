import os
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)

# ─── INIT ─────────────────────────────────────────────────

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    logger.critical("❌ OPENAI_API_KEY missing from .env")
    raise EnvironmentError("OPENAI_API_KEY not found in environment variables.")

client = OpenAI(api_key=OPENAI_API_KEY)
logger.info("✅ OpenAI client initialized")

# ─── MODELS ───────────────────────────────────────────────

GENERATION_MODEL = "gpt-4o-mini"
EMBEDDING_MODEL  = "text-embedding-3-small"  # 1536 dimensions


# ─── GENERATE ─────────────────────────────────────────────

def generate(prompt: str, system_prompt: str = None) -> str:
    """
    Send a prompt to OpenAI and get a text response.
    Used by: summary, explanation, quiz, recommendation, chatbot
    """
    try:
        messages = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(
            model=GENERATION_MODEL,
            messages=messages
        )

        result = response.choices[0].message.content
        logger.debug(f"✅ OpenAI generate response received")
        return result

    except Exception as e:
        logger.error(f"❌ OpenAI generate failed: {str(e)}")
        raise Exception(f"OpenAI generation failed: {str(e)}")


# ─── EMBED ────────────────────────────────────────────────

def embed(text: str) -> list:
    """
    Convert text to embedding vector (1536 numbers).
    Used by: RAG pipeline when storing lecture slides
    """
    try:
        if not text or not text.strip():
            raise ValueError("Cannot embed empty text")

        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text
        )

        vector = response.data[0].embedding
        logger.debug(f"✅ OpenAI embedding received | dimensions={len(vector)}")
        return vector

    except Exception as e:
        logger.error(f"❌ OpenAI embed failed: {str(e)}")
        raise Exception(f"OpenAI embedding failed: {str(e)}")


# ─── EMBED QUERY ──────────────────────────────────────────

def embed_query(text: str) -> list:
    """
    Embed a search query.
    Used by: retriever when student asks a question
    OpenAI uses same model for both document and query embedding.
    """
    try:
        if not text or not text.strip():
            raise ValueError("Cannot embed empty query")

        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text
        )

        vector = response.data[0].embedding
        logger.debug(f"✅ OpenAI query embedding received | dimensions={len(vector)}")
        return vector

    except Exception as e:
        logger.error(f"❌ OpenAI embed_query failed: {str(e)}")
        raise Exception(f"OpenAI query embedding failed: {str(e)}")