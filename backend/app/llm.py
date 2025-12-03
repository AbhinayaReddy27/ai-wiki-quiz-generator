import json
from typing import Dict, Any, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from .config import GOOGLE_API_KEY


class LLMNotConfiguredError(Exception):
    pass


def _build_llm():
    """
    Build the Gemini LLM client.
    """
    if not GOOGLE_API_KEY:
        raise LLMNotConfiguredError(
            "GOOGLE_API_KEY is not set. Please export your Gemini API key "
            "as GOOGLE_API_KEY in the environment."
        )

    # Use stable, supported Gemini model
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash-latest",
        api_key=GOOGLE_API_KEY,
    )


QUIZ_PROMPT = ChatPromptTemplate.from_template(
    """You are an assistant that generates quizzes grounded STRICTLY in the provided article.

Article title: {title}

Article content:
{article_text}

Generate a quiz with 5-10 multiple-choice questions based ONLY on the article.
Return JSON with the following structure EXACTLY:

{{
  "quiz": [
    {{
      "question": "Question text based only on the article",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Exactly one of the options (must match an element of options)",
      "difficulty": "easy" | "medium" | "hard",
      "explanation": "Short explanation grounded in the article"
    }}
  ],
  "related_topics": ["topic1", "topic2", "topic3"]
}}

STRICT rules:
- Use ONLY facts mentioned or clearly implied in the article.
- Make options plausible and non-trivial.
- Vary difficulty across questions.
- DO NOT talk about APIs, models, errors, backend, or quiz generation failures.
- DO NOT explain that something went wrong.
- Ask questions ONLY about the article content.
- Output ONLY valid JSON. No backticks, no code fences, no extra commentary.
"""
)


def _extract_text_from_llm_content(content: Any) -> str:
    """Handle different possible shapes of result.content from LangChain."""
    # Already a plain string
    if isinstance(content, str):
        return content

    # Sometimes it's a list of parts with {"type": "text", "text": "..."}
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
    Gemini sometimes adds extra text. We try to keep only the JSON object:
    - Strip code fences ```json ... ```
    - Take substring from first '{' to last '}'.
    - If we only see `"quiz": ...` without outer braces, wrap it.
    """
    text = raw.strip()

    # Strip ```json ... ```
    if "```" in text:
        first = text.find("```")
        last = text.rfind("```")
        inner = text[first + 3:last]  # remove ```
        # Remove possible "json" after opening ```
        inner = inner.lstrip("json").strip()
        text = inner

    # If there's extra text, keep only the outermost JSON object
    if "{" in text and "}" in text:
        start = text.find("{")
        end = text.rfind("}")
        text = text[start : end + 1]
    else:
        # No braces, but maybe we got only `"quiz": ...` etc.
        stripped = text.lstrip()
        if stripped.startswith('"quiz"') or stripped.startswith("'quiz'"):
            text = "{" + text + "}"

    return text


def generate_quiz_and_topics(data: Dict[str, Any]) -> Dict[str, Any]:
    """Call Gemini via LangChain to generate quiz questions and related topics."""
    llm_client = _build_llm()
    prompt = QUIZ_PROMPT.format_messages(
        title=data["title"],
        article_text=data["article_text"],
    )
    result = llm_client.invoke(prompt)

    raw_content = getattr(result, "content", result)
    content_str = _extract_text_from_llm_content(raw_content)
    json_candidate = _extract_json_block(content_str)

    try:
        parsed = json.loads(json_candidate)
    except json.JSONDecodeError as e:
        # Surface as clear error so FastAPI can show it
        raise ValueError(
            f"LLM did not return valid JSON: {e}. "
            f"Raw output (first 400 chars): {content_str[:400]}"
        )

    if "quiz" not in parsed or "related_topics" not in parsed:
        raise ValueError(
            f"LLM JSON is missing required keys: 'quiz' and 'related_topics'. "
            f"Parsed keys: {list(parsed.keys())}"
        )

    return parsed
