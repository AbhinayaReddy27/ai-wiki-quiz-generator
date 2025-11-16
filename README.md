# AI Wiki Quiz Generator

This project implements the **DeepKlarity Technologies - AI Wiki Quiz Generator**:

- **Backend**: Python + FastAPI (no Node.js)
- **Database**: SQLAlchemy ORM (defaults to SQLite, can be configured for MySQL / PostgreSQL)
- **Frontend**: Minimal HTML + Vanilla JS, clean card-based layout
- **LLM**: Gemini (via `langchain-google-genai`)
- **Scraping**: BeautifulSoup on raw Wikipedia HTML (no Wikipedia API)

---

## 1. Project Structure

```text
ai_wiki_quiz/
  backend/
    app/
      __init__.py
      main.py
      config.py
      database.py
      models.py
      schemas.py
      scraping.py
      llm.py
      crud.py
    requirements.txt
  frontend/
    index.html
    styles.css
    app.js
  sample_data/
    urls.txt
    alan_turing.json
  README.md
```

---

## 2. Backend Setup (FastAPI)

### 2.1. Create & activate virtual environment

```bash
cd ai_wiki_quiz/backend

# Linux / macOS
python -m venv venv
source venv/bin/activate

# Windows (PowerShell)
python -m venv venv
venv\Scripts\Activate.ps1
```

### 2.2. Install dependencies

```bash
pip install -r requirements.txt
```

### 2.3. Environment variables

Create a `.env` file in `backend/` (optional) or export variables in your shell:

- **DATABASE_URL** (optional, defaults to SQLite)

  - SQLite (default, good for local testing):

    ```bash
    export DATABASE_URL="sqlite:///./quiz.db"
    ```

  - PostgreSQL example:

    ```bash
    export DATABASE_URL="postgresql+psycopg2://user:password@localhost:5432/ai_wiki_quiz"
    ```

  - MySQL example:

    ```bash
    export DATABASE_URL="mysql+pymysql://user:password@localhost:3306/ai_wiki_quiz"
    ```

- **GOOGLE_API_KEY** (required)

  ```bash
  export GOOGLE_API_KEY="your_gemini_api_key_here"
  ```

### 2.4. Run the FastAPI server

From `ai_wiki_quiz/backend`:

```bash
uvicorn app.main:app --reload
```

The API will be available at: `http://127.0.0.1:8000`

Health check:

```bash
curl http://127.0.0.1:8000/health
```

---

## 3. Frontend Setup

The frontend is a minimal HTML/JS UI that talks to the FastAPI backend.

### 3.1. Start the backend first

Make sure the FastAPI server is running on `http://127.0.0.1:8000`.

### 3.2. Open the frontend

Simply open `frontend/index.html` in your browser (double-click or use VS Code Live Server).

The UI has two tabs:

1. **Generate Quiz**
   - Paste a Wikipedia URL.
   - Click **Generate Quiz**.
   - Optionally enable **Take Quiz mode** to hide answers and get scored.
2. **Past Quizzes**
   - Shows a table of previously generated quizzes from the database.
   - Click **Details** to open a modal with full quiz details.

---

## 4. API Endpoints

Base URL: `http://127.0.0.1:8000`

### 4.1. Health

```http
GET /health
```

**Response**

```json
{ "status": "ok" }
```

### 4.2. Generate quiz

```http
POST /api/quizzes/
Content-Type: application/json

{
  "url": "https://en.wikipedia.org/wiki/Alan_Turing"
}
```

**Flow**

1. Scrapes the Wikipedia article (HTML only, no Wikipedia API).
2. Extracts:
   - `title`
   - `summary`
   - `sections`
   - full `article_text`
3. Sends to Gemini LLM via LangChain prompt template:
   - Generates 5–10 MCQ questions with:
     - `question`
     - `options` (A–D)
     - `answer`
     - `difficulty`
     - `explanation`
   - Also returns `related_topics`.
4. Stores everything in the database (`quizzes` table).
5. Returns JSON in the target format.

**Successful Response (shape)**

```json
{
  "id": 1,
  "url": "https://en.wikipedia.org/wiki/Alan_Turing",
  "title": "Alan Turing",
  "summary": "Alan Turing was a British mathematician and computer scientist...",
  "key_entities": {
    "people": [],
    "organizations": [],
    "locations": []
  },
  "sections": ["Early life", "World War II", "Legacy"],
  "quiz": [
    {
      "question": "Where did Alan Turing study?",
      "options": [
        "Harvard University",
        "Cambridge University",
        "Oxford University",
        "Princeton University"
      ],
      "answer": "Cambridge University",
      "difficulty": "easy",
      "explanation": "Mentioned in the 'Early life' section."
    }
  ],
  "related_topics": ["Cryptography", "Enigma machine", "Computer science history"]
}
```

> Note: For brevity, key entities are stored as JSON, and the current extraction is naive.
> You can extend `scraping.py` to perform more advanced entity extraction if desired.

### 4.3. List past quizzes

```http
GET /api/quizzes/
```

**Response**

```json
[
  {
    "id": 1,
    "url": "https://en.wikipedia.org/wiki/Alan_Turing",
    "title": "Alan Turing",
    "created_at": "2025-11-16T10:00:00.000000"
  }
]
```

### 4.4. Get quiz by ID

```http
GET /api/quizzes/{quiz_id}
```

**Response**

Same structure as the `POST /api/quizzes/` response, including all questions.

---

## 5. Sample Data

Inside `sample_data/`:

- `urls.txt` – sample Wikipedia URLs used for testing.
- `alan_turing.json` – example of a generated quiz JSON for the Alan Turing article.

---

## 6. LangChain Prompt Templates

Located in `backend/app/llm.py`:

- `QUIZ_PROMPT` – used to generate both:
  - `quiz` (questions, options, answers, explanations, difficulty)
  - `related_topics` (list of Wikipedia topics for further reading)

The prompt explicitly instructs Gemini to:

- Use ONLY article content (minimizing hallucination)
- Return **strict JSON**
- Vary question difficulty and keep questions grounded in the text

You can tune this prompt further for better quiz quality.

---

## 7. Error Handling

The backend handles:

- Invalid or unreachable URLs – returns `400` with a descriptive error.
- Missing article content – returns `400`.
- Missing `GOOGLE_API_KEY` or LLM errors – returns `500` with a helpful message.
- Non-existent quiz IDs – returns `404`.

---

## 8. Notes and Extensions

- Although the ORM defaults to **SQLite** for quick local setup,
  you can easily switch to **MySQL** or **PostgreSQL** by updating `DATABASE_URL`.
- To strictly follow the requirement of MySQL/PostgreSQL for production,
  configure a real MySQL/PostgreSQL instance and point `DATABASE_URL` to it.
- You can extend:
  - Key entity extraction (e.g., using spaCy or LLM-based extraction).
  - Section-wise question grouping in the UI.
  - Authentication, pagination, and more advanced caching.

---

## 9. Running End-to-End

1. Start FastAPI backend:

   ```bash
   cd ai_wiki_quiz/backend
   uvicorn app.main:app --reload
   ```

2. Open frontend:

   - Open `ai_wiki_quiz/frontend/index.html` in your browser.

3. Use the app:

   - Go to the **Generate Quiz** tab.
   - Paste a Wikipedia URL.
   - Click **Generate Quiz**.
   - Switch to **Past Quizzes** to view history and open details.
