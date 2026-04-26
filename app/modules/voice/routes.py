# app/modules/voice/routes.py
import os
import logging
from flask import Blueprint, request, jsonify, send_file, current_app
from app.modules.voice.services import VoiceService
from app.shared.middleware import jwt_required

logger = logging.getLogger(__name__)

voice_bp = Blueprint('voice', __name__)


@voice_bp.route('/transcribe', methods=['POST'])
@jwt_required
def transcribe_audio():
    """
    Transcribe audio to text (Speech-to-Text) with AUTO language detection
    
    Expected: multipart/form-data with 'audio' field
    
    Returns: Transcribed text with detected language and dialect
    """
    logger.info(f"📨 POST /voice/transcribe | user_id={request.user_id}")
    
    try:
        # Validate audio file
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        # Process voice message - NO language parameter (auto-detect)
        result = VoiceService.process_voice_message(
            audio_file=audio_file,
            user_id=request.user_id,
            language=None  # Auto-detect
        )
        
        logger.info(f"✅ Transcription completed | language={result['language']} | dialect={result['dialect']}")
        
        return jsonify({
            'success': True,
            'transcription': result['text'],
            'language': result['language'],
            'dialect': result['dialect'],
            'dialect_name': result['dialect_name'],
            'duration': result.get('duration')
        }), 200
        
    except ValueError as e:
        logger.warning(f"⚠️  Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"❌ Error transcribing audio: {str(e)}")
        return jsonify({'error': 'Failed to transcribe audio'}), 500


@voice_bp.route('/synthesize', methods=['POST'])
@jwt_required
def synthesize_speech():
    """
    Convert text to speech (Text-to-Speech)
    
    Expected JSON:
    {
        "text": "النص العربي هنا",
        "voice": "nova",  // optional: alloy, echo, fable, onyx, nova, shimmer
        "format": "mp3"   // optional: mp3, opus, aac, flac
    }
    
    Returns: Audio file
    """
    logger.info(f"📨 POST /voice/synthesize | user_id={request.user_id}")
    
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        voice = data.get('voice', 'nova')
        output_format = data.get('format', 'mp3')
        
        # Validate voice
        if voice not in VoiceService.TTS_VOICES:
            return jsonify({
                'error': f'Invalid voice. Available: {", ".join(VoiceService.TTS_VOICES.keys())}'
            }), 400
        
        # Generate speech
        audio_file = VoiceService.text_to_speech(
            text=text,
            voice=voice,
            output_format=output_format
        )
        
        logger.info(f"✅ Speech synthesized | file={audio_file}")
        
        # Return audio file
        return send_file(
            audio_file,
            mimetype=f'audio/{output_format}',
            as_attachment=True,
            download_name=f'speech.{output_format}'
        )
        
    except Exception as e:
        logger.error(f"❌ Error synthesizing speech: {str(e)}")
        return jsonify({'error': 'Failed to generate speech'}), 500


@voice_bp.route('/audio/<filename>', methods=['GET'])
def get_audio_file(filename):
    """
    Serve generated audio files
    """
    logger.info(f"📨 GET /voice/audio/{filename}")
    
    try:
        audio_path = os.path.join('uploads/tts', filename)
        
        if not os.path.exists(audio_path):
            return jsonify({'error': 'Audio file not found'}), 404
        
        return send_file(
            audio_path,
            mimetype='audio/mpeg',
            as_attachment=False
        )
        
    except Exception as e:
        logger.error(f"❌ Error serving audio: {str(e)}")
        return jsonify({'error': 'Failed to serve audio file'}), 500


@voice_bp.route('/dialects', methods=['GET'])
def get_supported_dialects():
    """
    Get list of supported Arabic dialects
    """
    logger.info(f"📨 GET /voice/dialects")
    
    return jsonify({
        'success': True,
        'dialects': VoiceService.SUPPORTED_ARABIC_DIALECTS
    }), 200


@voice_bp.route('/voices', methods=['GET'])
def get_available_voices():
    """
    Get list of available TTS voices
    """
    logger.info(f"📨 GET /voice/voices")
    
    return jsonify({
        'success': True,
        'voices': VoiceService.TTS_VOICES
    }), 200