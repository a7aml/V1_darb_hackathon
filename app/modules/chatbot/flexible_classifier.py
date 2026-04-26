# app/modules/chatbot/flexible_classifier.py
"""
Flexible AI-Powered Question Classifier
Uses intelligent pattern matching instead of rigid keywords
"""

import logging

logger = logging.getLogger(__name__)


class FlexibleQuestionClassifier:
    """
    Intelligent classifier that doesn't restrict to specific keywords
    Uses context and question structure to determine intent
    """
    
    @staticmethod
    def classify(question, has_lecture=False):
        """
        Flexibly classify question based on intent, not keywords
        
        Args:
            question: User's question
            has_lecture: Whether a lecture is currently loaded
        
        Returns:
            str: 'lecture_strict', 'general_preferred', or 'hybrid'
        """
        question_lower = question.lower().strip()
        
        # 1. STRICT LECTURE QUESTIONS - Only when explicitly asking about lecture
        strict_lecture_indicators = [
            'according to',
            'in the lecture',
            'in slide',
            'on slide',
            'the lecture says',
            'professor said',
            'the material',
            'from the presentation',
            'in this document',
        ]
        
        if any(indicator in question_lower for indicator in strict_lecture_indicators):
            logger.info(f"📚 STRICT LECTURE (explicit reference)")
            return 'lecture_strict'
        
        # 2. GENERAL PREFERRED - Meta questions about the bot
        meta_questions = [
            'who are you',
            'what are you',
            'what can you',
            'how can you help',
            'what is your',
            'introduce yourself',
        ]
        
        if any(meta in question_lower for meta in meta_questions):
            logger.info(f"🤖 GENERAL PREFERRED (meta question)")
            return 'general_preferred'
        
        # 3. NO LECTURE - Must use general knowledge
        if not has_lecture:
            logger.info(f"🌐 GENERAL PREFERRED (no lecture)")
            return 'general_preferred'
        
        # 4. EVERYTHING ELSE - HYBRID (the flexible approach)
        # This includes:
        # - "What is AI?"
        # - "Explain X"
        # - "How does Y work?"
        # - Any other question
        logger.info(f"🔀 HYBRID (flexible - will use lecture if relevant, otherwise general knowledge)")
        return 'hybrid'