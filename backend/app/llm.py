import json
from typing import Dict, Any, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from .config import GOOGLE_API_KEY


class LLMNotConfiguredError(Exception):
    pass


def _build_llm():
    """
    FIXED MODEL NAME:
    Use the globally supported Gemini model:
    - gemini-1.5-flash
    (NO -latest, NO -pro)

    Render uses an older Gemini backend that does NOT support -latest.
    """
    if not GOOGLE_API_KEY:
        raise LLMNotConfiguredError(
            "GOOGLE_API_KEY is not set. Please export your Gemini API key "
            "as GOOGLE_API_KEY in the environment."
        )

    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",   #  <-- FIXED HERE
        api_key=GOOGLE_API_KEY,
    )


QUIZ_PROMPT = ChatPromptTemplate.from_template(
    """You are an assistant that generates quizzes grounded STRICTLY in the provided article.

Article title: {title}

Article content:
{article_text}

Generate a quiz with 5-10 multiple-choice questions based ONLY on the article.
Return JSON with the following structure EXACTLY:

{
  "quiz": [
    {
      "question": "Question text based only on the article",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Exactly one of the options",
      "difficulty": "easy" | "medium" | "hard",
      "explanation": "Short explanation based on the article"
    }
  ],
  "related_topics": ["topic1", "topic2", "topic3"]
}

STRICT RULES:
- Use ONLY article facts
- NO commentary
- ONLY valid JSON output
"""
)


def _extract_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for p in content:
            if isinstance(p, dict) and "text" in p:
                parts.append(p["text"])
            else:
                parts.append(str(p))
        return "".join(parts)
    return str(content)


def _extract_json(raw: str) -> str:
    raw = raw.strip()
    if "```" in raw:
        a = raw.find("```")
        b = raw.rfind("```")
        raw = raw[a+3:b].lstrip("json").strip()

    if "{" in raw and "}" in raw:
        i = raw.find("{")
        j = raw.rfind("}")
        return raw[i:j+1]

    # Fallback
    if raw.startswith('"quiz"'):
        return "{" + raw + "}"

    return raw


def generate_quiz_and_topics(data: Dict[str, Any]) -> Dict[str, Any]:
    llm = _build_llm()
    prompt = QUIZ_PROMPT.format_messages(
        title=data["title"],
        article_text=data["article_text"]
    )

    result = llm.invoke(prompt)
    content = _extract_text(result.content)
    json_text = _extract_json(content)

    try:
        parsed = json.loads(json_text)
    except Exception as e:
        raise ValueError(
            f"Invalid JSON from LLM: {e}. Raw: {content[:400]}"
        )

    if "quiz" not in parsed or "related_topics" not in parsed:
        raise ValueError("Missing keys in JSON: 'quiz' or 'related_topics'")

    return parsed
