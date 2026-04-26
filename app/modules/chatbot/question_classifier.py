# app/modules/chatbot/question_classifier.py
"""
Question Classifier for Hybrid RAG + General Knowledge Chatbot
Determines whether to use lecture context, general knowledge, or both
"""

import logging

logger = logging.getLogger(__name__)


class QuestionClassifier:
    """Classifies questions to determine response strategy"""
    
    # Keywords that indicate lecture-specific questions
    LECTURE_SPECIFIC_KEYWORDS = [
        'according to the lecture',
        'in the slides',
        'in slide',
        'on slide',
        'what did we learn',
        'from the lecture',
        'professor said',
        'the lecture mentioned',
        'in this lecture',
        'from this material',
        'the presentation',
        'the document says',
    ]
    
    # Keywords that indicate general/meta questions
    GENERAL_META_KEYWORDS = [
        'who are you',
        'what are you',
        'what can you do',
        'how can you help',
        'what is your purpose',
        'introduce yourself',
        'tell me about yourself',
        'what features',
        'how to use',
        'help me',
    ]
    
    # General knowledge request patterns
    GENERAL_KNOWLEDGE_PATTERNS = [
        'what is',
        'define',
        'explain',
        'how does',
        'why does',
        'tell me about',
        'describe',
    ]
    
    @staticmethod
    def classify(question, has_lecture=False):
        """
        Classify question to determine response strategy
        
        Args:
            question: User's question
            has_lecture: Whether a lecture is currently loaded
        
        Returns:
            str: 'lecture_only', 'general_only', or 'hybrid'
        """
        question_lower = question.lower().strip()
        
        # 1. Check for lecture-specific keywords
        if any(keyword in question_lower for keyword in QuestionClassifier.LECTURE_SPECIFIC_KEYWORDS):
            logger.info(f"📚 Classified as LECTURE_ONLY (explicit lecture reference)")
            return 'lecture_only'
        
        # 2. Check for general/meta questions (about the bot itself)
        if any(keyword in question_lower for keyword in QuestionClassifier.GENERAL_META_KEYWORDS):
            logger.info(f"🤖 Classified as GENERAL_ONLY (meta question)")
            return 'general_only'
        
        # 3. If no lecture loaded, must be general
        if not has_lecture:
            logger.info(f"🌐 Classified as GENERAL_ONLY (no lecture context)")
            return 'general_only'
        
        # 4. Short questions (1-3 words) without context → try lecture first, then general
        word_count = len(question_lower.split())
        if word_count <= 3:
            logger.info(f"🔀 Classified as HYBRID (short question: {word_count} words)")
            return 'hybrid'
        
        # 5. Questions that start with general patterns but we have a lecture
        starts_with_general = any(
            question_lower.startswith(pattern) 
            for pattern in QuestionClassifier.GENERAL_KNOWLEDGE_PATTERNS
        )
        
        if starts_with_general and has_lecture:
            logger.info(f"🔀 Classified as HYBRID (general pattern with lecture)")
            return 'hybrid'
        
        # 6. Default: if we have a lecture, try hybrid approach
        if has_lecture:
            logger.info(f"🔀 Classified as HYBRID (default with lecture)")
            return 'hybrid'
        else:
            logger.info(f"🌐 Classified as GENERAL_ONLY (default without lecture)")
            return 'general_only'
    
    @staticmethod
    def should_include_lecture_context(question_type, lecture_found):
        """
        Determine if lecture context should be included in response
        
        Args:
            question_type: Classification result
            lecture_found: Whether relevant lecture content was found
        
        Returns:
            bool: Whether to include lecture context
        """
        if question_type == 'lecture_only':
            return True
        elif question_type == 'general_only':
            return False
        else:  # hybrid
            return lecture_found