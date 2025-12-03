from typing import List
import json

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import SessionLocal, engine, Base
from .config import CORS_ORIGINS
from . import models, schemas, scraping, crud, llm

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Wiki Quiz Generator")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS] if CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/quizzes/", response_model=schemas.QuizOut)
def generate_quiz(payload: schemas.QuizCreate, db: Session = Depends(get_db)):
    """
    Generate a quiz for a given Wikipedia URL.

    - If the URL was already processed, return the cached quiz.
    - Otherwise scrape, call LLM, store in DB, and return.
    """
    # 1) Check cache
    existing = crud.get_quiz_by_url(db, payload.url)
    if existing:
        return crud.quiz_to_schema(existing)

    # 2) Scrape article
    try:
        article_data = scraping.scrape_wikipedia_article(payload.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error scraping article: {e}")

    if not article_data.get("article_text"):
        raise HTTPException(
            status_code=400,
            detail="Could not extract article text from the URL.",
        )

    summary = article_data.get("summary", "")

    # Very naive key entity extraction from summary (placeholder)
    key_entities = {
        "people": [],
        "organizations": [],
        "locations": [],
    }

    # 3) Call LLM to generate quiz
    try:
        quiz_data = llm.generate_quiz_and_topics(article_data)
    except llm.LLMNotConfiguredError as e:
        # Config problem (missing API key etc.)
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        # IMPORTANT: expose the real underlying error while debugging
        raise HTTPException(
            status_code=500,
            detail=f"Error generating quiz from LLM: {e}",
        )

    quiz = quiz_data.get("quiz", [])
    related_topics = quiz_data.get("related_topics", [])

    if not quiz:
        raise HTTPException(
            status_code=500,
            detail="LLM did not return any quiz questions.",
        )

    # 4) Persist to DB
    db_quiz = crud.create_quiz(
        db=db,
        url=str(payload.url),
        title=article_data["title"],
        summary=summary,
        key_entities_json=json.dumps(key_entities),
        sections_json=json.dumps(article_data.get("sections", [])),
        quiz_json=json.dumps(quiz),
        related_topics_json=json.dumps(related_topics),
    )

    # 5) Return as schema
    return crud.quiz_to_schema(db_quiz)


@app.get("/api/quizzes/", response_model=List[schemas.QuizSummary])
def list_quizzes(db: Session = Depends(get_db)):
    """
    List quizzes (most recent first).
    """
    quizzes = crud.list_quizzes(db)
    return [
        schemas.QuizSummary(
            id=q.id,
            url=q.url,
            title=q.title,
            created_at=q.created_at.isoformat() if q.created_at else None,
        )
        for q in quizzes
    ]


@app.get("/api/quizzes/{quiz_id}", response_model=schemas.QuizOut)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """
    Get a single quiz by ID.
    """
    db_quiz = crud.get_quiz(db, quiz_id)
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")
    return crud.quiz_to_schema(db_quiz)
