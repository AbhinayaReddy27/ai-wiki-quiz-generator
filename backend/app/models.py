from sqlalchemy import Column, Integer, String, Text, DateTime, func
from .database import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(500), unique=True, index=True, nullable=False)
    title = Column(String(300), nullable=False)
    summary = Column(Text, nullable=True)
    key_entities_json = Column(Text, nullable=True)
    sections_json = Column(Text, nullable=True)
    quiz_json = Column(Text, nullable=False)
    related_topics_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
