from typing import List, Dict, Optional
from pydantic import BaseModel, HttpUrl

class KeyEntities(BaseModel):
    people: List[str] = []
    organizations: List[str] = []
    locations: List[str] = []

class Question(BaseModel):
    question: str
    options: List[str]
    answer: str
    difficulty: str
    explanation: str

class QuizBase(BaseModel):
    url: HttpUrl

class QuizCreate(QuizBase):
    pass

class QuizSummary(BaseModel):
    id: int
    url: str
    title: str
    created_at: Optional[str]

    class Config:
        orm_mode = True

class QuizOut(BaseModel):
    id: int
    url: str
    title: str
    summary: str
    key_entities: KeyEntities
    sections: List[str]
    quiz: List[Question]
    related_topics: List[str]

    class Config:
        orm_mode = True
