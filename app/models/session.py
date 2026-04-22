from app.extensions import db
from datetime import datetime
import uuid


class QuizSession(db.Model):
    __tablename__ = "quiz_sessions"

    id               = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id          = db.Column(db.String, db.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    user_id          = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lecture_id       = db.Column(db.String, db.ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False)
    score            = db.Column(db.Integer, default=0)
    total_questions  = db.Column(db.Integer, nullable=False)
    correct_count    = db.Column(db.Integer, default=0)
    wrong_count      = db.Column(db.Integer, default=0)
    xp_earned        = db.Column(db.Integer, default=0)
    time_taken_seconds = db.Column(db.Integer, nullable=True)
    completed_at     = db.Column(db.DateTime, default=datetime.utcnow)

    attempts = db.relationship("QuestionAttempt", backref="session", cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            "id":                str(self.id),
            "quiz_id":           str(self.quiz_id),
            "lecture_id":        str(self.lecture_id),
            "score":             self.score,
            "total_questions":   self.total_questions,
            "correct_count":     self.correct_count,
            "wrong_count":       self.wrong_count,
            "xp_earned":         self.xp_earned,
            "time_taken_seconds": self.time_taken_seconds,
            "completed_at":      str(self.completed_at)
        }


class QuestionAttempt(db.Model):
    __tablename__ = "question_attempts"

    id             = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id     = db.Column(db.String, db.ForeignKey("quiz_sessions.id", ondelete="CASCADE"), nullable=False)
    question_id    = db.Column(db.String, db.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    student_answer = db.Column(db.String(255), nullable=True)
    is_correct     = db.Column(db.Boolean, nullable=False)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":             str(self.id),
            "session_id":     str(self.session_id),
            "question_id":    str(self.question_id),
            "student_answer": self.student_answer,
            "is_correct":     self.is_correct,
            "created_at":     str(self.created_at)
        }