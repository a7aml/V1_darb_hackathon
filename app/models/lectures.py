from app.extensions import db
from datetime import datetime
import uuid


class Lecture(db.Model):
    __tablename__ = "lectures"

    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    file_url = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(5), default="en")  # 'en' or 'ar'
    total_slides = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    slides = db.relationship("Slide", backref="lecture", cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "file_url": self.file_url,
            "language": self.language,
            "total_slides": self.total_slides,
            "created_at": str(self.created_at)
        }


class Slide(db.Model):
    __tablename__ = "slides"

    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lecture_id = db.Column(db.String, db.ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False)
    slide_number = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    summary = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "lecture_id": str(self.lecture_id),
            "slide_number": self.slide_number,
            "content": self.content,
            "summary": self.summary,
            "created_at": str(self.created_at)
        }