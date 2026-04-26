import logging
from flask import Blueprint, request, jsonify, send_file
from app.shared.middleware import jwt_required
from app.modules.chatbot.services import ask_question
from app.modules.chatbot.flexible_hybrid_service import FlexibleHybridChatbot
from app.modules.chatbot.voice_chat import VoiceChatbotService
import os

logger = logging.getLogger(__name__)
chatbot_bp = Blueprint("chatbot", __name__)


@chatbot_bp.route("/ask", methods=["POST"])
@jwt_required
def ask():
    """Standard text-based chatbot endpoint"""
    logger.info(f"📨 POST /chatbot/ask | user_id={request.user_id}")

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    lecture_id = data.get("lecture_id", "").strip()
    message = data.get("message", "").strip()

    if not lecture_id:
        return jsonify({"error": "lecture_id required"}), 400

    if not message:
        return jsonify({"error": "message required"}), 400

    # Try to get answer using OLD system first (to get lecture context)
    old_response, old_status = ask_question(lecture_id, request.user_id, message)
    
    # Check if old system found content or not
    if old_status == 200:
        old_answer = old_response.get('answer', '')
        
        # Check if old system couldn't find information
        lecture_not_found = (
            "couldn't find relevant information" in old_answer.lower() or
            "provided content does not" in old_answer.lower() or
            "no relevant information" in old_answer.lower()
        )
        
        if lecture_not_found:
            # Old system failed - use HYBRID approach
            logger.info(f"🔀 Old system found no info → Using HYBRID chatbot")
            
            # Get lecture context from old response (if any)
            lecture_context = old_response.get('sources', [])
            lecture_title = old_response.get('lecture_title', 'the lecture')
            
            # Use hybrid service for intelligent answer
            hybrid_response = FlexibleHybridChatbot.answer_question(
                question=message,
                lecture_context=lecture_context if lecture_context else None,
                lecture_title=lecture_title,
                user_id=request.user_id
            )
            
            # Return hybrid response
            return jsonify({
                'answer': hybrid_response['answer'],
                'sources': hybrid_response.get('sources', []),
                'type': 'hybrid'
            }), 200
        
        else:
            # Old system found good content - use it
            logger.info(f"✅ Old system found content → Using it")
            return jsonify(old_response), old_status
    
    else:
        # Old system had an error - fallback to general knowledge
        logger.warning(f"⚠️ Old system error → Fallback to general knowledge")
        
        hybrid_response = FlexibleHybridChatbot.answer_question(
            question=message,
            lecture_context=None,
            lecture_title=None,
            user_id=request.user_id
        )
        
        return jsonify({
            'answer': hybrid_response['answer'],
            'sources': [],
            'type': 'general'
        }), 200


@chatbot_bp.route("/ask-voice", methods=["POST"])
@jwt_required
def ask_voice():
    """
    Voice conversation endpoint - Returns text + audio response
    
    Expected JSON:
    {
        "lecture_id": "...",
        "message": "What is AI?",
        "voice": "nova",  // optional
        "language": "en"   // optional
    }
    """
    logger.info(f"🎤 POST /chatbot/ask-voice | user_id={request.user_id}")

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    lecture_id = data.get("lecture_id", "").strip()
    message = data.get("message", "").strip()
    voice = data.get("voice", "nova")
    language = data.get("language", "en")

    if not lecture_id:
        return jsonify({"error": "lecture_id required"}), 400

    if not message:
        return jsonify({"error": "message required"}), 400

    try:
        # Get lecture context using existing system
        old_response, old_status = ask_question(lecture_id, request.user_id, message)
        
        # Extract lecture context
        lecture_context = old_response.get('sources', []) if old_status == 200 else []
        lecture_title = old_response.get('lecture_title', 'the lecture') if old_status == 200 else None
        
        # Generate voice response
        voice_response = VoiceChatbotService.ask_with_voice_response(
            question=message,
            lecture_context=lecture_context,
            lecture_title=lecture_title,
            user_id=request.user_id,
            voice=voice,
            language=language
        )
        
        # Get audio filename from full path
        audio_file = voice_response.get('audio_file')
        if audio_file:
            audio_filename = os.path.basename(audio_file)
            audio_url = f"/api/voice/audio/{audio_filename}"
        else:
            audio_url = None
        
        logger.info(f"✅ Voice response generated | Audio: {audio_url}")
        
        return jsonify({
            'answer': voice_response['answer'],
            'audio_url': audio_url,
            'sources': voice_response.get('sources', []),
            'type': voice_response.get('type', 'hybrid'),
            'voice_used': voice_response.get('voice_used', voice)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error in voice chat: {str(e)}")
        return jsonify({'error': 'Failed to generate voice response'}), 500