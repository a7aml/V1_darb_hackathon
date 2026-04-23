1. AUTH MODULE
POST /auth/signup
Description: Register new student with email & password
Request Body:
json{
  "email": "student@email.com",
  "password": "123456",
  "full_name": "Ali Ahmed"
}
Response:
json{
  "message": "Account created successfully",
  "user_id": "uuid"
}

POST /auth/login
Description: Login with email & password
Request Body:
json{
  "email": "student@email.com",
  "password": "123456"
}
Response:
json{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "full_name": "Ali Ahmed",
    "email": "student@email.com"
  }
}

POST /auth/google
Description: Login or signup via Google OAuth
Request Body:
json{
  "google_token": "google_oauth_token"
}
Response:
json{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "full_name": "Ali Ahmed",
    "email": "student@gmail.com"
  }
}

GET /auth/me
Description: Get current logged in user info from token
Response:
json{
  "id": "uuid",
  "full_name": "Ali Ahmed",
  "email": "student@email.com",
  "created_at": "2024-01-01"
}

PUT /auth/profile
Description: Update user profile information
Request Body:
json{
  "full_name": "Ali Ahmed Updated"
}
Response:
json{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "full_name": "Ali Ahmed Updated",
    "email": "student@email.com"
  }
}

PUT /auth/password
Description: Change user password
Request Body:
json{
  "old_password": "123456",
  "new_password": "newpass123"
}
Response:
json{
  "message": "Password changed successfully"
}

2. UPLOAD MODULE
POST /upload/lecture
Description: Upload PDF or DOCX lecture file
Request: multipart/form-data
FieldTypeDescriptionfileFilePDF or DOCX onlytitleStringLecture titlelanguageStringen or ar
Response:
json{
  "message": "Lecture uploaded and processed successfully",
  "lecture_id": "uuid",
  "total_slides": 12
}

GET /upload/lectures
Description: Get all lectures uploaded by the logged in student
Response:
json{
  "lectures": [
    {
      "id": "uuid",
      "title": "Chapter 1 - Intro to AI",
      "total_slides": 12,
      "language": "en",
      "file_url": "https://...",
      "created_at": "2024-01-01"
    }
  ]
}

GET /upload/lecture/<lecture_id>
Description: Get single lecture details with all slides
Response:
json{
  "id": "uuid",
  "title": "Chapter 1 - Intro to AI",
  "total_slides": 12,
  "language": "en",
  "file_url": "https://...",
  "created_at": "2024-01-01",
  "slides": [
    {
      "id": "uuid",
      "slide_number": 1,
      "content": "Introduction to AI..."
    }
  ]
}

DELETE /upload/lecture/<lecture_id>
Description: Soft delete a lecture (sets deleted_at timestamp)
Response:
json{
  "message": "Lecture deleted successfully"
}

GET /upload/lecture/<lecture_id>/slides
Description: Get all slides for a specific lecture
Response:
json{
  "lecture_id": "uuid",
  "slides": [
    {
      "id": "uuid",
      "slide_number": 1,
      "content": "Introduction to AI..."
    }
  ]
}

3. STUDY CONTENT MODULE
GET /study/summary/<lecture_id>
Description: Get AI generated summary for full lecture
Response:
json{
  "lecture_id": "uuid",
  "title": "Introduction to AI",
  "language": "en",
  "summary": "This lecture covers..."
}

GET /study/explain/<lecture_id>/<slide_number>
Description: Get AI explanation for a specific slide
Response:
json{
  "lecture_id": "uuid",
  "slide_number": 3,
  "language": "en",
  "explanation": "This slide talks about..."
}

GET /study/flashcards/<lecture_id>
Description: Get AI generated flashcards for the lecture
Response:
json{
  "lecture_id": "uuid",
  "language": "en",
  "flashcards": [
    {
      "id": 1,
      "front": "What is Machine Learning?",
      "back": "A subset of AI that allows machines to learn from data",
      "slide_ref": 2
    }
  ]
}

GET /study/mindmap/<lecture_id>
Description: Get AI generated mind map structure for the lecture
Response:
json{
  "lecture_id": "uuid",
  "language": "en",
  "mindmap": {
    "central": "Artificial Intelligence",
    "branches": [
      {
        "id": "1",
        "label": "Machine Learning",
        "children": [
          {
            "id": "1-1",
            "label": "Supervised Learning",
            "children": []
          }
        ]
      }
    ]
  }
}

GET /study/glossary/<lecture_id>
Description: Get AI generated key terms and definitions for the lecture
Response:
json{
  "lecture_id": "uuid",
  "language": "en",
  "glossary": [
    {
      "id": 1,
      "term": "Neural Network",
      "definition": "A computational model inspired by the human brain.",
      "example": "Recognizing cats in images after training.",
      "slide_ref": 3
    }
  ]
}

GET /study/tldr/<lecture_id>/<slide_number>
Description: Get a one sentence TL;DR summary for a specific slide
Response:
json{
  "lecture_id": "uuid",
  "slide_number": 1,
  "language": "en",
  "tldr": "Machine learning enables systems to learn from data."
}

4. QUIZ MODULE
POST /quiz/generate
Description: Generate quiz questions for a lecture
Request Body:
json{
  "lecture_id": "uuid",
  "type": "mcq",
  "difficulty": "medium",
  "num_questions": 10,
  "slide_number": null
}

type → mcq or true_false
difficulty → easy, medium, hard
slide_number → null for full lecture, number for specific slide

Response:
json{
  "quiz_id": "uuid",
  "type": "mcq",
  "difficulty": "medium",
  "language": "en",
  "questions": [
    {
      "id": "uuid",
      "question": "What is supervised learning?",
      "type": "mcq",
      "difficulty": "medium",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "slide_ref": 3
    }
  ]
}

POST /quiz/submit
Description: Submit student answers for a quiz
Request Body:
json{
  "quiz_id": "uuid",
  "lecture_id": "uuid",
  "time_taken": 120,
  "answers": [
    {
      "question_id": "uuid",
      "answer": "A"
    }
  ]
}
Response:
json{
  "session_id": "uuid",
  "score": 80,
  "total": 100,
  "correct": 8,
  "wrong": 2,
  "xp_earned": 50,
  "time_taken": 120
}

GET /quiz/history/<lecture_id>
Description: Get all quiz attempts for a specific lecture
Response:
json{
  "lecture_id": "uuid",
  "attempts": [
    {
      "session_id": "uuid",
      "score": 80,
      "correct": 8,
      "wrong": 2,
      "xp_earned": 50,
      "type": "mcq",
      "difficulty": "medium",
      "date": "2024-01-01"
    }
  ]
}

GET /quiz/session/<session_id>
Description: Get detailed quiz session with all questions and answers
Response:
json{
  "session_id": "uuid",
  "quiz_id": "uuid",
  "lecture_id": "uuid",
  "score": 80,
  "correct": 8,
  "wrong": 2,
  "xp_earned": 50,
  "time_taken": 120,
  "completed_at": "2024-01-01",
  "questions": [
    {
      "question_id": "uuid",
      "question": "What is supervised learning?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "student_answer": "A",
      "correct_answer": "A",
      "is_correct": true,
      "slide_ref": 3
    }
  ]
}

DELETE /quiz/<quiz_id>
Description: Delete a quiz (only if not submitted yet)
Response:
json{
  "message": "Quiz deleted successfully"
}

5. ASSESSMENT MODULE
GET /assessment/result/<session_id>
Description: Get detailed result for a specific quiz session
Response:
json{
  "session_id": "uuid",
  "lecture_id": "uuid",
  "score": 80,
  "total": 100,
  "correct": 8,
  "wrong": 2,
  "xp_earned": 50,
  "time_taken": 120,
  "questions": [
    {
      "question_id": "uuid",
      "question": "What is supervised learning?",
      "student_answer": "A",
      "correct_answer": "A",
      "is_correct": true,
      "slide_ref": 3
    }
  ]
}

GET /assessment/progress/<lecture_id>
Description: Get overall student progress for a lecture
Response:
json{
  "lecture_id": "uuid",
  "total_sessions": 5,
  "average_score": 74,
  "best_score": 90,
  "worst_score": 60,
  "total_xp": 250,
  "weak_slides": [2, 5, 7],
  "strong_slides": [1, 3, 4]
}

GET /assessment/dashboard
Description: Get overall student progress across all lectures
Response:
json{
  "total_lectures": 3,
  "total_quizzes": 15,
  "total_xp": 750,
  "average_score": 78,
  "lectures": [
    {
      "lecture_id": "uuid",
      "title": "Intro to AI",
      "sessions": 5,
      "average_score": 80,
      "xp_earned": 250
    }
  ]
}

6. RECOMMENDATION MODULE
GET /recommendation/<lecture_id>
Description: Get AI recommendations based on student weakness
Response:
json{
  "lecture_id": "uuid",
  "weak_topics": [
    {
      "slide_number": 3,
      "topic": "Neural Networks",
      "weakness_score": 40,
      "recommendation": "Review slide 3 and focus on backpropagation"
    }
  ],
  "general_advice": "Strong in theory, weak in application. Practice more MCQs.",
  "suggested_actions": [
    "Re-study slide 3",
    "Take another quiz on difficult level",
    "Review flashcards for weak topics"
  ]
}

7. CHATBOT MODULE
POST /chatbot/ask
Description: Ask a question related to the lecture (RAG-powered)
Request Body:
json{
  "lecture_id": "uuid",
  "message": "Can you explain what overfitting means?"
}
Response:
json{
  "lecture_id": "uuid",
  "question": "Can you explain what overfitting means?",
  "answer": "Overfitting happens when a model learns the training data too well...",
  "source_slides": [5, 7],
  "confidence": 0.92
}

GET /chatbot/history/<lecture_id>
Description: Get previous chat messages for a lecture
Response:
json{
  "lecture_id": "uuid",
  "messages": [
    {
      "id": "uuid",
      "question": "What is overfitting?",
      "answer": "Overfitting happens...",
      "timestamp": "2024-01-01 10:30:00"
    }
  ]
}

SUMMARY TABLE
#MethodEndpointModule1POST/auth/signupAuth2POST/auth/loginAuth3POST/auth/googleAuth4GET/auth/meAuth5PUT/auth/profileAuth6PUT/auth/passwordAuth7POST/upload/lectureUpload8GET/upload/lecturesUpload9GET/upload/lecture/<lecture_id>Upload10DELETE/upload/lecture/<lecture_id>Upload11GET/upload/lecture/<lecture_id>/slidesUpload12GET/study/summary/<lecture_id>Study13GET/study/explain/<lecture_id>/<slide_number>Study14GET/study/flashcards/<lecture_id>Study15GET/study/mindmap/<lecture_id>Study16GET/study/glossary/<lecture_id>Study17GET/study/tldr/<lecture_id>/<slide_number>Study18POST/quiz/generateQuiz19POST/quiz/submitQuiz20GET/quiz/history/<lecture_id>Quiz21GET/quiz/session/<session_id>Quiz22DELETE/quiz/<quiz_id>Quiz23GET/assessment/result/<session_id>Assessment24GET/assessment/progress/<lecture_id>Assessment25GET/assessment/dashboardAssessment26GET/recommendation/<lecture_id>Recommendation27POST/chatbot/askChatbot28GET/chatbot/history/<lecture_id>Chatbot
Total: 28 APIs