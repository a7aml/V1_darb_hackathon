# StudyGPT API Documentation
> Base URL: `http://localhost:5000/api`  
> All requests need header: `Authorization: Bearer <JWT_TOKEN>` except Login & Signup

---

## 1. AUTH MODULE

### POST `/auth/signup`
**Description:** Register new student with email & password

**Request Body:**
```json
{
  "email": "student@email.com",
  "password": "123456",
  "full_name": "Ali Ahmed"
}
```
**Response:**
```json
{
  "message": "Account created successfully",
  "user_id": "uuid"
}
```

---

### POST `/auth/login`
**Description:** Login with email & password

**Request Body:**
```json
{
  "email": "student@email.com",
  "password": "123456"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "full_name": "Ali Ahmed",
    "email": "student@email.com"
  }
}
```

---

### POST `/auth/google`
**Description:** Login or signup via Google OAuth

**Request Body:**
```json
{
  "google_token": "google_oauth_token"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "full_name": "Ali Ahmed",
    "email": "student@gmail.com"
  }
}
```

---

## 2. UPLOAD MODULE

### POST `/upload/lecture`
**Description:** Upload PDF or DOCX lecture file

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| file | File | PDF or DOCX only |
| title | String | Lecture title |
| language | String | `en` or `ar` |

**Response:**
```json
{
  "message": "Lecture uploaded and processed successfully",
  "lecture_id": "uuid",
  "total_slides": 12
}
```

---

### GET `/upload/lectures`
**Description:** Get all lectures uploaded by the logged in student

**Response:**
```json
{
  "lectures": [
    {
      "id": "uuid",
      "title": "Chapter 1 - Intro to AI",
      "total_slides": 12,
      "language": "en",
      "created_at": "2024-01-01"
    }
  ]
}
```

---

## 3. STUDY CONTENT MODULE

### GET `/study/summary/<lecture_id>`
**Description:** Get AI generated summary for full lecture

**Response:**
```json
{
  "lecture_id": "uuid",
  "summary": "This lecture covers..."
}
```

---

### GET `/study/explain/<lecture_id>/<slide_number>`
**Description:** Get AI explanation for a specific slide

**Response:**
```json
{
  "slide_number": 3,
  "explanation": "This slide talks about..."
}
```

---

### GET `/study/flashcards/<lecture_id>`
**Description:** Get AI generated flashcards for the lecture

**Response:**
```json
{
  "flashcards": [
    {
      "id": 1,
      "front": "What is Machine Learning?",
      "back": "A subset of AI that allows machines to learn from data"
    }
  ]
}
```

---

## 4. QUIZ MODULE

### POST `/quiz/generate`
**Description:** Generate quiz questions for a lecture

**Request Body:**
```json
{
  "lecture_id": "uuid",
  "type": "mcq",
  "difficulty": "medium",
  "num_questions": 10,
  "slide_number": null
}
```
> `type` → `mcq` or `true_false`  
> `difficulty` → `easy`, `medium`, `hard`  
> `slide_number` → null for full lecture, number for specific slide

**Response:**
```json
{
  "quiz_id": "uuid",
  "questions": [
    {
      "id": 1,
      "question": "What is supervised learning?",
      "type": "mcq",
      "difficulty": "medium",
      "options": ["A", "B", "C", "D"],
      "slide_ref": 3
    }
  ]
}
```

---

### POST `/quiz/submit`
**Description:** Submit student answers for a quiz

**Request Body:**
```json
{
  "quiz_id": "uuid",
  "lecture_id": "uuid",
  "time_taken": 120,
  "answers": [
    {
      "question_id": 1,
      "answer": "A"
    }
  ]
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "score": 80,
  "total": 100,
  "correct": 8,
  "wrong": 2,
  "xp_earned": 50
}
```

---

### GET `/quiz/history/<lecture_id>`
**Description:** Get all quiz attempts for a specific lecture

**Response:**
```json
{
  "attempts": [
    {
      "session_id": "uuid",
      "score": 80,
      "date": "2024-01-01",
      "type": "mcq",
      "difficulty": "medium"
    }
  ]
}
```

---

## 5. ASSESSMENT MODULE

### GET `/assessment/result/<session_id>`
**Description:** Get detailed result for a specific quiz session

**Response:**
```json
{
  "session_id": "uuid",
  "score": 80,
  "xp_earned": 50,
  "questions": [
    {
      "question_id": 1,
      "question": "What is supervised learning?",
      "student_answer": "A",
      "correct_answer": "A",
      "is_correct": true,
      "slide_ref": 3
    }
  ]
}
```

---

### GET `/assessment/progress/<lecture_id>`
**Description:** Get overall student progress for a lecture

**Response:**
```json
{
  "lecture_id": "uuid",
  "total_sessions": 5,
  "average_score": 74,
  "best_score": 90,
  "total_xp": 250,
  "weak_slides": [2, 5, 7]
}
```

---

## 6. RECOMMENDATION MODULE

### GET `/recommendation/<lecture_id>`
**Description:** Get AI recommendations based on student weakness

**Response:**
```json
{
  "lecture_id": "uuid",
  "weak_topics": [
    {
      "slide_number": 3,
      "topic": "Neural Networks",
      "weakness_score": 40,
      "recommendation": "Review slide 3 again and focus on backpropagation concept"
    }
  ],
  "general_advice": "You are strong in theory but weak in application questions. Practice more MCQs."
}
```

---

## 7. CHATBOT MODULE

### POST `/chatbot/ask`
**Description:** Ask a question related to the lecture

**Request Body:**
```json
{
  "lecture_id": "uuid",
  "message": "Can you explain what overfitting means?"
}
```

**Response:**
```json
{
  "answer": "Overfitting happens when a model learns the training data too well...",
  "source_slide": 5
}
```

---

## SUMMARY TABLE

| # | Method | Endpoint | Module |
|---|--------|----------|--------|
| 1 | POST | `/auth/signup` | Auth |
| 2 | POST | `/auth/login` | Auth |
| 3 | POST | `/auth/google` | Auth |
| 4 | POST | `/upload/lecture` | Upload |
| 5 | GET | `/upload/lectures` | Upload |
| 6 | GET | `/study/summary/<lecture_id>` | Study |
| 7 | GET | `/study/explain/<lecture_id>/<slide_number>` | Study |
| 8 | GET | `/study/flashcards/<lecture_id>` | Study |
| 9 | POST | `/quiz/generate` | Quiz |
| 10 | POST | `/quiz/submit` | Quiz |
| 11 | GET | `/quiz/history/<lecture_id>` | Quiz |
| 12 | GET | `/assessment/result/<session_id>` | Assessment |
| 13 | GET | `/assessment/progress/<lecture_id>` | Assessment |
| 14 | GET | `/recommendation/<lecture_id>` | Recommendation |
| 15 | POST | `/chatbot/ask` | Chatbot |

**Total: 15 APIs**

---

> RAG pipeline is internal backend only. No API exposed to frontend.  
> All responses return `400` or `500` with `{ "error": "message" }` on failure.