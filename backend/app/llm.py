import json
from typing import Dict, Any, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from .config import GOOGLE_API_KEY


class LLMNotConfiguredError(Exception):
    pass


def _build_llm():
    """Return Gemini Flash client"""
    if not GOOGLE_API_KEY:
        raise LLMNotConfiguredError(
            "GOOGLE_API_KEY is not set. Please export your Gemini API key."
        )

    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        api_key=GOOGLE_API_KEY,
        temperature=0.2,
        max_output_tokens=2048,
        stop=["```", "</json>"]
    )


QUIZ_PROMPT = ChatPromptTemplate.from_template(
    """
Return ONLY valid JSON. No talking. No explanations. No text outside JSON.

You are an assistant that generates quiz questions STRICTLY from the article below.

Article title: {title}

Article text:
{article_text}

Generate between 5–10 MCQs.

RETURN JSON EXACTLY LIKE THIS:
{
 "quiz": [
   {
     "question": "text",
     "options": ["A", "B", "C", "D"],
     "answer": "A",
     "difficulty": "easy",
     "explanation": "short explanation"
   }
 ],
 "related_topics": ["t1", "t2"]
}
"""
)


def _extract_text_from_llm_content(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, dict) and "text" in part:
                parts.append(part["text"])
        return "".join(parts)
    return str(content)


def _safe_json_extract(raw: str) -> str:
    """Extracts the first valid JSON object from raw text."""
    text = raw.strip()

    # Remove code fences
    if "```" in text:
        text = text.replace("```json", "").replace("```", "").strip()

    # Extract from first { to last }
    if "{" in text and "}" in text:
        start = text.find("{")
        end = text.rfind("}") + 1
        return text[start:end]

    return text


def generate_quiz_and_topics(data: Dict[str, Any]) -> Dict[str, Any]:
    llm = _build_llm()

    prompt = QUIZ_PROMPT.format_messages(
        title=data["title"],
        article_text=data["article_text"]
    )

    result = llm.invoke(prompt)

    raw_content = getattr(result, "content", result)
    content_str = _extract_text_from_llm_content(raw_content)
    cleaned = _safe_json_extract(content_str)

    try:
        parsed = json.loads(cleaned)
    except Exception:
        raise ValueError(f"Gemini returned invalid JSON:\n\n{content_str[:500]}")

    # Validate required keys
    if "quiz" not in parsed or "related_topics" not in parsed:
        raise ValueError("Invalid JSON: missing quiz or related_topics")

    return parsed
