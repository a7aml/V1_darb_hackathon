from app.extensions import db
from datetime import datetime
from pgvector.sqlalchemy import Vector
import uuid


class Embedding(db.Model):
    __tablename__ = "embeddings"

    id         = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    slide_id   = db.Column(db.String, db.ForeignKey("slides.id", ondelete="CASCADE"), nullable=False)
    lecture_id = db.Column(db.String, db.ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False)
    embedding  = db.Column(Vector(1536), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":         str(self.id),
            "slide_id":   str(self.slide_id),
            "lecture_id": str(self.lecture_id),
            "created_at": str(self.created_at)
        }