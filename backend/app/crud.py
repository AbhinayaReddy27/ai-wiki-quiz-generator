from typing import List, Optional
import json

from sqlalchemy.orm import Session

from . import models, schemas


def get_quiz(db: Session, quiz_id: int) -> Optional[models.Quiz]:
    """Get a single quiz by ID."""
    return (
        db.query(models.Quiz)
        .filter(models.Quiz.id == quiz_id)
        .first()
    )


def get_quiz_by_url(db: Session, url: str) -> Optional[models.Quiz]:
    """
    Get the most recent quiz for a given URL.

    NOTE: `url` might be a Pydantic HttpUrl object in the caller,
    so we always cast to str() before comparing with the DB column (TEXT).
    """
    url_str = str(url)

    return (
        db.query(models.Quiz)
        .filter(models.Quiz.url == url_str)
        .order_by(models.Quiz.created_at.desc())
        .first()
    )


def get_quizzes(db: Session, skip: int = 0, limit: int = 100) -> List[models.Quiz]:
    """Get a list of quizzes, newest first."""
    return (
        db.query(models.Quiz)
        .order_by(models.Quiz.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def list_quizzes(db: Session, skip: int = 0, limit: int = 100) -> List[models.Quiz]:
    """
    Small wrapper so main.py can call crud.list_quizzes().
    """
    return get_quizzes(db, skip=skip, limit=limit)


def create_quiz(
    db: Session,
    *,
    url: str,
    title: str,
    summary: str,
    key_entities_json: str,
    sections_json: str,
    quiz_json: str,
    related_topics_json: str,
) -> models.Quiz:
    """
    Create and persist a new Quiz row.

    All JSON-like fields are passed in as already-serialized strings.
    """
    db_quiz = models.Quiz(
        url=str(url),
        title=title,
        summary=summary,
        key_entities_json=key_entities_json,
        sections_json=sections_json,
        quiz_json=quiz_json,
        related_topics_json=related_topics_json,
    )

    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz


def quiz_to_schema(quiz: models.Quiz) -> schemas.QuizOut:
    """
    Convert a Quiz ORM object into a QuizOut Pydantic schema,
    deserializing JSON fields.
    """
    return schemas.QuizOut(
        id=quiz.id,
        url=quiz.url,
        title=quiz.title,
        summary=quiz.summary,
        key_entities=json.loads(quiz.key_entities_json) if quiz.key_entities_json else {},
        sections=json.loads(quiz.sections_json) if quiz.sections_json else [],
        quiz=json.loads(quiz.quiz_json) if quiz.quiz_json else [],
        related_topics=json.loads(quiz.related_topics_json)
        if quiz.related_topics_json
        else [],
        created_at=quiz.created_at,
    )
