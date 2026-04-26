# app/modules/chatbot/flexible_hybrid_service.py
"""
Flexible Hybrid Chatbot Service
ALWAYS tries to help - never says "can't find in lecture"
"""

import logging
from openai import OpenAI
from flask import current_app
from app.modules.chatbot.flexible_classifier import FlexibleQuestionClassifier

logger = logging.getLogger(__name__)


class FlexibleHybridChatbot:
    """
    Truly flexible chatbot that ALWAYS provides helpful answers
    """
    
    @staticmethod
    def answer_question(question, lecture_context=None, lecture_title=None, user_id=None):
        """
        Answer ANY question intelligently
        
        Strategy:
        1. If lecture content is relevant → use it
        2. If lecture content exists but not relevant → use general knowledge + context
        3. If no lecture → use general knowledge
        4. NEVER say "can't find in lecture"
        
        Args:
            question: User's question
            lecture_context: Retrieved lecture content (can be None or empty)
            lecture_title: Title of the lecture
            user_id: User ID for logging
        
        Returns:
            dict: Response with answer and sources
        """
        try:
            client = OpenAI(api_key=current_app.config.get('OPENAI_API_KEY'))
            
            # Check what we have
            has_lecture = lecture_context is not None and len(lecture_context) > 0
            has_lecture_title = lecture_title is not None
            
            # Classify question
            question_type = FlexibleQuestionClassifier.classify(question, has_lecture_title)
            
            logger.info(f"🤖 Question: '{question[:50]}...' | Type: {question_type} | Has content: {has_lecture}")
            
            # Build the perfect prompt based on what we have
            if question_type == 'lecture_strict':
                # User explicitly asked about lecture - must use lecture
                return FlexibleHybridChatbot._answer_strict_lecture(
                    client, question, lecture_context, lecture_title
                )
            
            elif question_type == 'general_preferred':
                # Meta questions or no lecture - use general knowledge
                return FlexibleHybridChatbot._answer_general(
                    client, question
                )
            
            else:  # hybrid - THE FLEXIBLE APPROACH
                return FlexibleHybridChatbot._answer_flexible_hybrid(
                    client, question, lecture_context, lecture_title, has_lecture
                )
            
        except Exception as e:
            logger.error(f"❌ Error: {str(e)}")
            return {
                'answer': "I encountered an error. Please try rephrasing your question.",
                'sources': [],
                'type': 'error'
            }
    
    @staticmethod
    def _answer_strict_lecture(client, question, lecture_context, lecture_title):
        """User explicitly asked about lecture - must use lecture only"""
        
        if not lecture_context or len(lecture_context) == 0:
            return {
                'answer': f"You asked about the lecture content specifically, but I couldn't find relevant information about this topic in '{lecture_title}'. Could you rephrase or ask about a different aspect?",
                'sources': [],
                'type': 'lecture_not_found'
            }
        
        context_text = "\n\n".join([
            f"[Slide {item.get('slide_number', '?')}]: {item.get('content', '')}"
            for item in lecture_context
        ])
        
        system_prompt = f"""You are a tutor for the lecture: "{lecture_title}".

The user explicitly asked about the lecture content.

Lecture Content:
{context_text}

Answer based on this content. Cite slides when possible."""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return {
            'answer': response.choices[0].message.content,
            'sources': [{"slide": item.get('slide_number')} for item in lecture_context[:3]],
            'type': 'lecture_strict'
        }
    
    @staticmethod
    def _answer_general(client, question):
        """Meta questions or no lecture - pure general knowledge"""
        
        system_prompt = """You are a friendly AI tutor assistant.

Answer questions helpfully and clearly. You can:
- Explain concepts in simple terms
- Provide definitions and examples
- Help students understand topics
- Create study materials

When asked about yourself, explain that you're an AI tutor that:
1. Helps understand uploaded lecture materials
2. Answers questions about any topic
3. Creates flashcards and summaries
4. Provides explanations and examples

Be concise, friendly, and educational."""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return {
            'answer': response.choices[0].message.content,
            'sources': [],
            'type': 'general'
        }
    
    @staticmethod
    def _answer_flexible_hybrid(client, question, lecture_context, lecture_title, has_lecture):
        """
        THE FLEXIBLE APPROACH - This is the magic!
        
        Always provides a helpful answer by:
        1. Using lecture if relevant
        2. Adding general knowledge if needed
        3. NEVER refusing to answer
        """
        
        if has_lecture:
            # We have lecture content - use it + general knowledge
            context_text = "\n\n".join([
                f"[Slide {item.get('slide_number', '?')}]: {item.get('content', '')}"
                for item in lecture_context[:5]
            ])
            
            system_prompt = f"""You are an intelligent AI tutor with access to lecture materials.

Current Lecture: "{lecture_title}"

Relevant Lecture Content:
{context_text}

IMPORTANT INSTRUCTIONS:
1. If the lecture content above is relevant to the question → Use it and cite slides
2. If the lecture content is NOT relevant OR doesn't fully answer → Use your general AI knowledge
3. You can COMBINE both: mention what the lecture covers + add general knowledge
4. NEVER say "I couldn't find in the lecture" - always provide a helpful answer
5. If the lecture has partial info, use it + add more from general knowledge

Examples:
- Q: "What is AI?" → Check lecture. If it defines AI, use it. If not, give general definition + relate to lecture topic.
- Q: "What is uniform search?" → Check lecture. If not covered, explain it generally + relate to search concepts.
- Q: "Explain X" → Always explain! Use lecture if relevant, otherwise use general knowledge.

Be educational, helpful, and NEVER refuse to answer."""
        
        else:
            # No lecture content found, but we know there's a lecture
            system_prompt = f"""You are an AI tutor helping with the lecture: "{lecture_title}".

The lecture content doesn't specifically cover this question, but provide a helpful answer anyway.

INSTRUCTIONS:
1. Answer the question using your general AI knowledge
2. Be educational and clear
3. If possible, relate your answer to the lecture topic
4. NEVER say "not in the lecture" - just answer helpfully

Be friendly and informative."""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=600
        )
        
        sources = []
        if has_lecture:
            sources = [{"slide": item.get('slide_number')} for item in lecture_context[:3]]
        
        return {
            'answer': response.choices[0].message.content,
            'sources': sources,
            'type': 'hybrid'
        }