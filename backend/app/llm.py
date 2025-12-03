import json
from typing import Dict, Any, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from .config import GOOGLE_API_KEY


class LLMNotConfiguredError(Exception):
    pass


# ============================================================
#  BUILD LLM CLIENT
# ============================================================
def _build_llm():
    if not GOOGLE_API_KEY:
        raise LLMNotConfiguredError(
            "GOOGLE_API_KEY is not set. Please export it in your Render environment."
        )

    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",      # ⭐ stable and valid model
        api_key=GOOGLE_API_KEY,
        temperature=0.3,
    )


# ============================================================
#  STRICT JSON-ONLY PROMPT (Fix #1)
# ============================================================
QUIZ_PROMPT = ChatPromptTemplate.from_template(
    """
You MUST return ONLY valid JSON. 
NO explanation, NO markdown, NO text before or after the JSON.

### ARTICLE TITLE
{title}

### ARTICLE CONTENT
{article_text}

### REQUIRED JSON FORMAT (RETURN ONLY THIS STRUCTURE)

{
  "quiz": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": "One of the options",
      "difficulty": "easy | medium | hard",
      "explanation": "One-line explanation"
    }
  ],
  "related_topics": ["topic1", "topic2"]
}

### RULES
- Output MUST start with `{` and end with `}` — no other characters allowed.
- DO NOT include ```json or code fences.
- DO NOT include comments or extra keys.
- Use ONLY facts from the article.
- Provide 5–10 questions.
"""
)


# ============================================================
#  CLEAN TEXT EXTRACTION FROM LLM RESPONSE
# ============================================================
def _extract_text_from_llm_content(content: Any) -> str:
    """Gemini sometimes returns list parts instead of raw string."""
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: List[str] = []
        for part in content:
            if isinstance(part, dict) and "text" in part:
                parts.append(part["text"])
            else:
                parts.append(str(part))
        return "".join(parts)

    return str(content)


# ============================================================
#  FIND JSON INSIDE OUTPUT (Fix #2)
# ============================================================
def _extract_json(raw: str) -> str:
    """
    Robust JSON extractor:
    - removes ```json fences
    - finds FIRST '{' and LAST '}'
    """

    cleaned = raw.strip()

    # Remove code fences if present
    cleaned = cleaned.replace("```json", "")
    cleaned = cleaned.replace("```", "").strip()

    # Find outer JSON object
    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start == -1 or end == -1:
        raise ValueError(f"No JSON object found in LLM output: {raw[:150]}")

    return cleaned[start:end + 1]


# ============================================================
#  MAIN FUNCTION — GENERATE QUIZ + RELATED TOPICS
# ============================================================
def generate_quiz_and_topics(article_data: Dict[str, Any]) -> Dict[str, Any]:
    llm = _build_llm()

    prompt = QUIZ_PROMPT.format_messages(
        title=article_data["title"],
        article_text=article_data["article_text"],
    )

    # Call Gemini
    result = llm.invoke(prompt)

    # Convert content to text
    raw_output = _extract_text_from_llm_content(getattr(result, "content", result))

    # Extract JSON only
    json_text = _extract_json(raw_output)

    # Parse JSON
    try:
        parsed = json.loads(json_text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"LLM returned invalid JSON: {e}. Output: {raw_output[:300]}"
        )

    # Validate keys
    if "quiz" not in parsed or "related_topics" not in parsed:
        raise ValueError(
            f"Missing required keys 'quiz' or 'related_topics'. Output: {raw_output[:300]}"
        )

    return parsed
