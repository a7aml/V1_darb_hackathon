# app/modules/chatbot/hybrid_service.py
"""
Hybrid Chatbot Service: RAG + General Knowledge
Intelligently combines lecture-specific context with general AI knowledge
"""

import logging
from openai import OpenAI
from flask import current_app
from app.modules.chatbot.question_classifier import QuestionClassifier

logger = logging.getLogger(__name__)


class HybridChatbotService:
    """
    Intelligent chatbot that combines:
    1. RAG (Retrieval-Augmented Generation) from lectures
    2. General AI knowledge
    """
    
    @staticmethod
    def answer_question(question, lecture_context=None, lecture_title=None, user_id=None):
        """
        Answer question using hybrid approach
        
        Args:
            question: User's question
            lecture_context: Retrieved lecture content (from RAG/embeddings)
            lecture_title: Title of the lecture
            user_id: User ID for logging
        
        Returns:
            dict: Response with answer, sources, and metadata
        """
        try:
            client = OpenAI(api_key=current_app.config.get('OPENAI_API_KEY'))
            
            # Classify question
            has_lecture = lecture_context is not None and len(lecture_context) > 0
            question_type = QuestionClassifier.classify(question, has_lecture)
            
            logger.info(f"🤖 Processing question | Type: {question_type} | Has lecture: {has_lecture}")
            
            # Build appropriate prompt based on classification
            if question_type == 'lecture_only':
                # Lecture-specific question - must use lecture
                response = HybridChatbotService._answer_from_lecture_only(
                    client, question, lecture_context, lecture_title
                )
            
            elif question_type == 'general_only':
                # General question - use AI knowledge
                response = HybridChatbotService._answer_from_general_knowledge(
                    client, question
                )
            
            else:  # hybrid
                # Try lecture first, fallback to general + lecture context
                response = HybridChatbotService._answer_hybrid(
                    client, question, lecture_context, lecture_title
                )
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Error in hybrid chatbot: {str(e)}")
            return {
                'answer': "Sorry, I encountered an error processing your question. Please try again.",
                'sources': [],
                'type': 'error'
            }
    
    @staticmethod
    def _answer_from_lecture_only(client, question, lecture_context, lecture_title):
        """Answer using ONLY lecture content"""
        
        if not lecture_context or len(lecture_context) == 0:
            return {
                'answer': f"I couldn't find information about this in the lecture. This question specifically asks about the lecture content, but no relevant information was found.",
                'sources': [],
                'type': 'lecture_not_found'
            }
        
        # Build context from lecture
        context_text = "\n\n".join([
            f"[Slide {item.get('slide_number', '?')}]: {item.get('content', '')}"
            for item in lecture_context
        ])
        
        system_prompt = f"""You are a helpful tutor assistant for the lecture: "{lecture_title}".

Answer the question using ONLY the lecture content provided below. 

Lecture Content:
{context_text}

Guidelines:
- Answer based strictly on the lecture content
- Cite specific slides when possible
- If the information is not in the lecture, say so clearly
- Be concise and educational"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        answer = response.choices[0].message.content
        
        # Extract sources
        sources = [
            {"slide": item.get('slide_number'), "content": item.get('content', '')[:100]}
            for item in lecture_context[:3]
        ]
        
        return {
            'answer': answer,
            'sources': sources,
            'type': 'lecture_only'
        }
    
    @staticmethod
    def _answer_from_general_knowledge(client, question):
        """Answer using general AI knowledge"""
        
        system_prompt = """You are a helpful AI tutor assistant.

Answer questions clearly and educationally. You can:
- Explain concepts
- Provide definitions
- Give examples
- Help with understanding

Be friendly, concise, and helpful. If asked about yourself, explain that you're an AI tutor that helps students learn by:
1. Answering questions about uploaded lectures
2. Explaining concepts
3. Creating study materials like flashcards and summaries
4. Providing practice questions"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        answer = response.choices[0].message.content
        
        return {
            'answer': answer,
            'sources': [],
            'type': 'general_knowledge'
        }
    
    @staticmethod
    def _answer_hybrid(client, question, lecture_context, lecture_title):
        """
        Hybrid approach: Use both lecture context AND general knowledge
        """
        
        # Check if we have lecture context
        has_lecture_content = lecture_context and len(lecture_context) > 0
        
        if has_lecture_content:
            # Build context from lecture
            context_text = "\n\n".join([
                f"[Slide {item.get('slide_number', '?')}]: {item.get('content', '')}"
                for item in lecture_context[:5]  # Top 5 most relevant
            ])
            
            system_prompt = f"""You are a helpful AI tutor assistant with access to the lecture: "{lecture_title}".

Lecture Context (most relevant sections):
{context_text}

Answer the question by:
1. First, check if the lecture content above is relevant and helpful
2. If the lecture has relevant information, use it and cite the slides
3. If the lecture doesn't have enough information, use your general knowledge AND mention what the lecture covered
4. Combine both lecture context and general knowledge for a complete answer

Guidelines:
- Be educational and helpful
- Cite slides when using lecture content (e.g., "According to Slide 5...")
- If adding information beyond the lecture, make it clear ("Additionally, it's worth noting...")
- If the lecture doesn't cover this topic well, acknowledge it and provide general knowledge
- Be concise but thorough"""
        
        else:
            # No lecture content found, but lecture exists - use general knowledge with context
            system_prompt = f"""You are a helpful AI tutor assistant for the lecture: "{lecture_title}".

The lecture content doesn't specifically cover this question, but you can still help by:
1. Providing a general answer using your AI knowledge
2. Relating it to the lecture topic if possible
3. Being educational and helpful

Answer the question using your general knowledge."""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=600
        )
        
        answer = response.choices[0].message.content
        
        # Extract sources if we used lecture content
        sources = []
        if has_lecture_content:
            sources = [
                {"slide": item.get('slide_number'), "content": item.get('content', '')[:100]}
                for item in lecture_context[:3]
            ]
        
        return {
            'answer': answer,
            'sources': sources,
            'type': 'hybrid'
        }