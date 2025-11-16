import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Database URL: can be PostgreSQL, MySQL, or SQLite.
# Examples:
#   postgresql+psycopg2://user:password@localhost:5432/ai_wiki_quiz
#   mysql+pymysql://user:password@localhost:3306/ai_wiki_quiz
#   sqlite:///./quiz.db  (default for local development)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'quiz.db'}")

# Gemini / LLM configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# CORS origins for frontend
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
