# app/modules/chatbot/voice_chat.py
"""
Voice Chatbot - Returns both text and audio responses
Professional implementation for voice conversation mode
"""

import logging
from flask import current_app
from app.modules.chatbot.flexible_hybrid_service import FlexibleHybridChatbot
from app.modules.voice.services import VoiceService

logger = logging.getLogger(__name__)


class VoiceChatbotService:
    """
    Enhanced chatbot that returns audio responses for voice conversations
    """
    
    @staticmethod
    def ask_with_voice_response(question, lecture_context=None, lecture_title=None, 
                                user_id=None, voice='nova', language='en'):
        """
        Answer question and generate voice response
        
        Args:
            question: User's question (text)
            lecture_context: Retrieved lecture content
            lecture_title: Title of the lecture
            user_id: User ID
            voice: TTS voice to use
            language: Language for response
        
        Returns:
            dict: {
                'answer': 'text response',
                'audio_file': 'path/to/audio.mp3',
                'sources': [...],
                'type': 'hybrid'
            }
        """
        try:
            # Get text answer using hybrid chatbot
            text_response = FlexibleHybridChatbot.answer_question(
                question=question,
                lecture_context=lecture_context,
                lecture_title=lecture_title,
                user_id=user_id
            )
            
            answer_text = text_response['answer']
            
            # Generate audio from answer
            logger.info(f"🔊 Generating voice response | Voice: {voice} | Length: {len(answer_text)} chars")
            
            # Clean text for better TTS (remove markdown, special chars)
            clean_text = VoiceChatbotService._clean_text_for_tts(answer_text)
            
            # Generate audio
            audio_file = VoiceService.text_to_speech(
                text=clean_text,
                voice=voice,
                output_format='mp3'
            )
            
            logger.info(f"✅ Voice response generated | File: {audio_file}")
            
            return {
                'answer': answer_text,
                'audio_file': audio_file,
                'sources': text_response.get('sources', []),
                'type': text_response.get('type', 'hybrid'),
                'voice_used': voice
            }
            
        except Exception as e:
            logger.error(f"❌ Error generating voice response: {str(e)}")
            # Fallback to text-only
            return {
                'answer': "I encountered an error generating the voice response. Here's the text answer: " + str(e),
                'audio_file': None,
                'sources': [],
                'type': 'error'
            }
    
    @staticmethod
    def _clean_text_for_tts(text):
        """
        Clean text for better text-to-speech output
        
        Args:
            text: Raw text with markdown, special chars
        
        Returns:
            str: Cleaned text optimized for TTS
        """
        import re
        
        # Remove markdown bold/italic
        text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
        text = re.sub(r'\*([^*]+)\*', r'\1', text)
        text = re.sub(r'__([^_]+)__', r'\1', text)
        text = re.sub(r'_([^_]+)_', r'\1', text)
        
        # Remove markdown headers
        text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
        
        # Remove bullet points
        text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
        
        # Remove numbered lists
        text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
        
        # Remove code blocks
        text = re.sub(r'```[\s\S]*?```', '[code block]', text)
        text = re.sub(r'`([^`]+)`', r'\1', text)
        
        # Remove links
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
        
        # Clean up multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Remove excessive newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text.strip()