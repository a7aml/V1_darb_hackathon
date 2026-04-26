# app/modules/voice/services.py
import os
import time
import logging
from openai import OpenAI
from flask import current_app

logger = logging.getLogger(__name__)

class VoiceService:
    """Service for handling voice chat with AUTO language detection"""
    
    # Arabic dialects supported by Whisper (auto-detected)
    SUPPORTED_ARABIC_DIALECTS = {
        'ar': 'Modern Standard Arabic (MSA)',
        'ar-EG': 'Egyptian Arabic',
        'ar-SA': 'Saudi Arabic',
        'ar-AE': 'Gulf Arabic (UAE)',
        'ar-MA': 'Moroccan Arabic',
        'ar-DZ': 'Algerian Arabic',
        'ar-TN': 'Tunisian Arabic',
        'ar-LB': 'Lebanese Arabic',
        'ar-SY': 'Syrian Arabic',
        'ar-IQ': 'Iraqi Arabic',
        'ar-JO': 'Jordanian Arabic',
        'ar-PS': 'Palestinian Arabic'
    }
    
    # TTS voices available
    TTS_VOICES = {
        'alloy': 'Neutral voice',
        'echo': 'Male voice',
        'fable': 'British accent',
        'onyx': 'Deep male voice',
        'nova': 'Female voice',
        'shimmer': 'Soft female voice'
    }
    
    # Allowed audio formats
    ALLOWED_AUDIO_FORMATS = {
        'audio/mpeg',       # mp3
        'audio/mp4',        # m4a
        'audio/wav',        # wav
        'audio/webm',       # webm (any codec)
        'audio/ogg',        # ogg
        'audio/flac',       # flac
        'audio/x-wav',      # alternative wav
        'audio/wave',       # alternative wav
        'application/octet-stream',  # fallback for unknown types
    }
    
    MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25MB (Whisper limit)
    MIN_AUDIO_SIZE = 1000  # 1KB minimum
    
    @staticmethod
    def speech_to_text(audio_file, language=None):
        """
        Convert speech to text using OpenAI Whisper with AUTO language detection
        
        Args:
            audio_file: Audio file object (FileStorage from Flask)
            language: Language code (None for auto-detect)
        
        Returns:
            Dict with transcription and metadata
        """
        try:
            client = OpenAI(api_key=current_app.config.get('OPENAI_API_KEY'))
            
            logger.info(f"🎤 Starting speech-to-text | Language: {'AUTO-DETECT' if not language else language}")
            
            # Reset file pointer to beginning
            audio_file.seek(0)
            
            # Read the file content
            audio_bytes = audio_file.read()
            
            # Check minimum size
            if len(audio_bytes) < VoiceService.MIN_AUDIO_SIZE:
                raise ValueError("Audio file is too small. Please record for at least 1 second.")
            
            # Get filename or use default based on content type
            content_type = audio_file.content_type or 'audio/webm'
            
            # Determine file extension from content type
            extension_map = {
                'audio/webm': 'webm',
                'audio/wav': 'wav',
                'audio/x-wav': 'wav',
                'audio/wave': 'wav',
                'audio/mpeg': 'mp3',
                'audio/mp4': 'm4a',
                'audio/ogg': 'ogg',
                'audio/flac': 'flac',
            }
            
            extension = extension_map.get(content_type, 'webm')
            filename = audio_file.filename or f'audio.{extension}'
            
            # Ensure filename has correct extension
            if not filename.endswith(f'.{extension}'):
                filename = f'audio.{extension}'
            
            logger.info(f"📁 File: {filename} | Size: {len(audio_bytes)} bytes | Type: {content_type}")
            
            # Create a tuple format that OpenAI SDK expects: (filename, file_content, content_type)
            file_tuple = (filename, audio_bytes, content_type)
            
            # Whisper API call - AUTO-DETECT language if not specified
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=file_tuple,
                language=language if language else None,  # None = auto-detect
                response_format="verbose_json"
            )
            
            detected_language = transcription.language
            logger.info(f"✅ Speech-to-text completed | Detected language: {detected_language} | Text length: {len(transcription.text)}")
            
            return {
                'text': transcription.text,
                'language': detected_language,
                'duration': getattr(transcription, 'duration', None)
            }
            
        except Exception as e:
            logger.error(f"❌ Speech-to-text error: {str(e)}")
            raise Exception(f"Failed to transcribe audio: {str(e)}")
    
    @staticmethod
    def text_to_speech(text, voice='nova', output_format='mp3'):
        """
        Convert text to speech using OpenAI TTS
        
        Args:
            text: Text to convert to speech
            voice: Voice to use (alloy, echo, fable, onyx, nova, shimmer)
            output_format: Output format (mp3, opus, aac, flac)
        
        Returns:
            Audio file path
        """
        try:
            client = OpenAI(api_key=current_app.config.get('OPENAI_API_KEY'))
            
            logger.info(f"🔊 Starting text-to-speech | Voice: {voice} | Text length: {len(text)}")
            
            # Create TTS directory if it doesn't exist
            tts_dir = 'uploads/tts'
            os.makedirs(tts_dir, exist_ok=True)
            
            # Generate unique filename
            timestamp = int(time.time())
            output_file = os.path.join(tts_dir, f"tts_{timestamp}.{output_format}")
            
            # TTS API call
            response = client.audio.speech.create(
                model="tts-1",  # or "tts-1-hd" for higher quality
                voice=voice,
                input=text,
                response_format=output_format
            )
            
            # Save audio file
            response.stream_to_file(output_file)
            
            logger.info(f"✅ Text-to-speech completed | File: {output_file}")
            
            return output_file
            
        except Exception as e:
            logger.error(f"❌ Text-to-speech error: {str(e)}")
            raise Exception(f"Failed to generate speech: {str(e)}")
    
    @staticmethod
    def detect_dialect(text, detected_language):
        """
        Detect Arabic dialect using linguistic patterns
        Enhanced with language detection
        
        Args:
            text: Transcribed text
            detected_language: Language detected by Whisper
        
        Returns:
            Detected dialect code
        """
        # If not Arabic, return the detected language code
        if detected_language != 'ar':
            return detected_language
        
        text_lower = text.lower()
        
        # Egyptian dialect indicators
        egyptian_markers = ['ازيك', 'ازاي', 'ده', 'دي', 'احنا', 'انتو', 'عامل', 'عاملة', 'ايه', 'كده']
        if any(marker in text_lower for marker in egyptian_markers):
            return 'ar-EG'
        
        # Gulf dialect indicators (Saudi, UAE)
        gulf_markers = ['شلونك', 'شخبارك', 'اشحالك', 'حياك', 'ويش', 'وش', 'شنو']
        if any(marker in text_lower for marker in gulf_markers):
            return 'ar-SA'
        
        # Levantine dialect indicators (Lebanese, Syrian, Jordanian, Palestinian)
        levantine_markers = ['شو', 'كيفك', 'هلق', 'يلا', 'مش', 'هيك', 'بدي', 'منيح']
        if any(marker in text_lower for marker in levantine_markers):
            return 'ar-LB'
        
        # Moroccan dialect indicators
        moroccan_markers = ['كيفاش', 'واش', 'بزاف', 'شحال', 'علاش', 'فين', 'دابا']
        if any(marker in text_lower for marker in moroccan_markers):
            return 'ar-MA'
        
        # Default to Modern Standard Arabic
        return 'ar'
    
    @staticmethod
    def validate_audio_file(file):
        """
        Validate uploaded audio file
        
        Args:
            file: FileStorage object
        
        Returns:
            True if valid, raises exception otherwise
        """
        if not file:
            raise ValueError("No audio file provided")
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size < VoiceService.MIN_AUDIO_SIZE:
            raise ValueError("Audio file too small. Please record for at least 1 second.")
        
        if file_size > VoiceService.MAX_AUDIO_SIZE:
            raise ValueError(f"Audio file too large. Maximum size: 25MB")
        
        # Be more lenient with content type checking
        content_type = file.content_type or 'audio/webm'
        
        # Accept if it's any audio type or octet-stream
        if not (content_type.startswith('audio/') or content_type == 'application/octet-stream'):
            raise ValueError(f"Invalid file type: {content_type}. Must be an audio file.")
        
        logger.info(f"✅ Audio validation passed | Size: {file_size} bytes | Type: {content_type}")
        
        return True
    
    @staticmethod
    def process_voice_message(audio_file, user_id, language=None):
        """
        Complete voice message processing pipeline with AUTO language detection
        
        Args:
            audio_file: Uploaded audio file
            user_id: User ID
            language: Language hint (None for auto-detect)
        
        Returns:
            Dict with transcription and metadata
        """
        try:
            # Validate audio
            VoiceService.validate_audio_file(audio_file)
            
            # Transcribe with AUTO language detection
            transcription = VoiceService.speech_to_text(audio_file, language)
            
            detected_language = transcription['language']
            
            # Detect dialect (enhanced with language info)
            detected_dialect = VoiceService.detect_dialect(
                transcription['text'],
                detected_language
            )
            
            # Get dialect name
            if detected_language == 'ar':
                dialect_name = VoiceService.SUPPORTED_ARABIC_DIALECTS.get(
                    detected_dialect, 'Arabic'
                )
            else:
                # For non-Arabic languages, use language code
                language_names = {
                    'en': 'English',
                    'es': 'Spanish',
                    'fr': 'French',
                    'de': 'German',
                    'it': 'Italian',
                    'pt': 'Portuguese',
                    'ru': 'Russian',
                    'ja': 'Japanese',
                    'ko': 'Korean',
                    'zh': 'Chinese',
                }
                dialect_name = language_names.get(detected_language, detected_language.upper())
            
            result = {
                'user_id': user_id,
                'text': transcription['text'],
                'language': detected_language,
                'dialect': detected_dialect,
                'dialect_name': dialect_name,
                'duration': transcription.get('duration')
            }
            
            logger.info(f"✅ Voice message processed | User: {user_id} | Language: {detected_language} | Dialect: {detected_dialect}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error processing voice message: {str(e)}")
            raise