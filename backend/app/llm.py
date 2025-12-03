import json
from typing import Dict, Any, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from .config import GOOGLE_API_KEY


class LLMNotConfiguredError(Exception):
    """Raised when GOOGLE_API_KEY is missing."""
    pass


def _build_llm():
    """
    Build the Gemini LLM client.

    Using 'gemini-1.5-pro' because it is widely supported and stable.
    If your account only supports 'gemini-pro', you can switch the
    model name below.
    """
    if not GOOGLE_API_KEY:
        raise LLMNotConfiguredError(
            "GOOGLE_API_KEY is not set. Please export your Gemini API key "
            "as GOOGLE_API_KEY in the environment."
        )

    return ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",  # change to "gemini-pro" if needed
        api_key=GOOGLE_API_KEY,
        temperature=0.2,
        max_output_tokens=2048,
    )


QUIZ_PROMPT = ChatPromptTemplate.from_template(
    """
You are an assistant that generates multiple–choice quizzes.

You MUST return a single valid JSON object and nothing else.

Article title: {title}

Article text:
{article_text}

Generate a quiz with 5–10 multiple–choice questions based ONLY on the article.

Return JSON with this structure EXACTLY:

{
  "quiz": [
    {
      "question": "Question text based only on the article",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Exactly one of the options (must match an element of options)",
      "difficulty": "easy" | "medium" | "hard",
      "explanation": "Short explanation grounded in the article"
    }
  ],
  "related_topics": [
    "topic1",
    "topic2",
    "topic3"
  ]
}

Rules:
- Use ONLY facts mentioned or clearly implied in the article.
- Make options plausible and non-trivial.
- Vary difficulty across questions.
- DO NOT talk about APIs, models, errors, or quiz generation.
- DO NOT add any text before or after the JSON.
- DO NOT wrap JSON in ```json fences.
"""
)


def _extract_text_from_llm_content(content: Any) -> str:
    """Handle different shapes of result.content from LangChain."""
    if isinstance(content, str):
        return content

    # Sometimes it's a list of { "type": "text", "text": "..." }
    if isinstance(content, list):
        parts: List[str] = []
        for part in content:
            if isinstance(part, dict) and "text" in part:
                parts.append(part["text"])
            else:
                parts.append(str(part))
        return "".join(parts)

    # Fallback
    return str(content)


def _extract_json_block(raw: str) -> str:
    """
    Try to strip any extra text and keep only the JSON object:

    - Remove ```json ... ``` fences if they exist.
    - Take substring from first '{' to last '}'.
    """
    text = raw.strip()

    # Strip ```json ... ``` fences
    if "```" in text:
        text = text.replace("```json", "").replace("```", "").strip()

    # If there are braces, keep only outermost JSON object
    if "{" in text and "}" in text:
        start = text.find("{")
        end = text.rfind("}") + 1
        text = text[start:end]

    return text


def generate_quiz_and_topics(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Call Gemini via LangChain to generate quiz questions and related topics.

    Returns a dict with keys:
    - "quiz": list[dict]
    - "related_topics": list[str]
    """
    llm = _build_llm()

    prompt = QUIZ_PROMPT.format_messages(
        title=data["title"],
        article_text=data["article_text"],
    )

    result = llm.invoke(prompt)

    raw_content = getattr(result, "content", result)
    content_str = _extract_text_from_llm_content(raw_content)
    json_candidate = _extract_json_block(content_str)

    # Try to parse JSON
    try:
        parsed = json.loads(json_candidate)
    except json.JSONDecodeError as e:
        # We raise a plain ValueError; main.py will turn it into a clean HTTPException
        raise ValueError(
            f"LLM did not return valid JSON: {e}. "
            f"Raw (first 200 chars): {content_str[:200]!r}"
        )

    # Basic shape validation
    if not isinstance(parsed, dict):
        raise ValueError("LLM JSON root is not an object.")

    if "quiz" not in parsed or "related_topics" not in parsed:
        raise ValueError("LLM JSON is missing required keys: 'quiz' and 'related_topics'.")

    return parsed
