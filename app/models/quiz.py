from app.extensions import db
from datetime import datetime
import uuid


class Quiz(db.Model):
    __tablename__ = "quizzes"

    id               = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lecture_id       = db.Column(db.String, db.ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False)
    user_id          = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type             = db.Column(db.String(20), nullable=False)       # 'mcq' or 'true_false'
    difficulty       = db.Column(db.String(20), nullable=False)       # 'easy', 'medium', 'hard'
    total_questions  = db.Column(db.Integer, nullable=False)
    has_timer        = db.Column(db.Boolean, default=False)
    time_limit_seconds = db.Column(db.Integer, nullable=True)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)

    questions = db.relationship("Question", backref="quiz", cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            "id":                str(self.id),
            "lecture_id":        str(self.lecture_id),
            "user_id":           str(self.user_id),
            "type":              self.type,
            "difficulty":        self.difficulty,
            "total_questions":   self.total_questions,
            "has_timer":         self.has_timer,
            "time_limit_seconds": self.time_limit_seconds,
            "created_at":        str(self.created_at)
        }


class Question(db.Model):
    __tablename__ = "questions"

    id              = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id         = db.Column(db.String, db.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    slide_id        = db.Column(db.String, db.ForeignKey("slides.id"), nullable=True)
    question_text   = db.Column(db.Text, nullable=False)
    options         = db.Column(db.JSON, nullable=True)       # null for true/false
    correct_answer  = db.Column(db.String(255), nullable=False)
    difficulty      = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        return {
            "id":            str(self.id),
            "quiz_id":       str(self.quiz_id),
            "slide_id":      str(self.slide_id) if self.slide_id else None,
            "question_text": self.question_text,
            "options":       self.options,
            "difficulty":    self.difficulty
            # correct_answer NOT included → never send to frontend
        }