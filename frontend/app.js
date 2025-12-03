// frontend/app.js

const API_BASE = "https://ai-wiki-quiz-generator-lvf4.onrender.com";


// ----- DOM ELEMENTS -----
const urlInput = document.getElementById("url-input");
const generateBtn = document.getElementById("generate-btn");
const takeQuizCheckbox = document.getElementById("take-quiz-mode");
const statusMessage = document.getElementById("status-message");
const quizOutput = document.getElementById("quiz-output");

const historyBody = document.getElementById("history-body");

const tabButtons = document.querySelectorAll(".tab-button");
const generateTab = document.getElementById("generate-tab");
const historyTab = document.getElementById("history-tab");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

// ----- HELPERS -----
function setStatus(message, type = "info") {
  statusMessage.textContent = message || "";
  statusMessage.className = "status";
  if (message) {
    statusMessage.classList.add(type);
  }
}

function clearQuizOutput() {
  quizOutput.innerHTML = "";
}

// Simple URL check for Wikipedia
function isValidWikipediaUrl(url) {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

// ----- TABS -----
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.getAttribute("data-tab");
    if (target === "generate-tab") {
      generateTab.classList.add("active");
      historyTab.classList.remove("active");
    } else {
      historyTab.classList.add("active");
      generateTab.classList.remove("active");
      loadHistory();
    }
  });
});

// ----- RENDER QUIZ -----
function renderQuiz(data, container, options = {}) {
  const { takeQuizMode = false } = options;

  container.innerHTML = "";

  // Header card with article info
  const headerCard = document.createElement("div");
  headerCard.className = "card";

  const titleEl = document.createElement("h2");
  titleEl.textContent = data.title || "Quiz";

  const summaryEl = document.createElement("p");
  summaryEl.textContent = data.summary || "";

  const urlEl = document.createElement("p");
  urlEl.className = "small-url";
  if (data.url) {
    const link = document.createElement("a");
    link.href = data.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open article";
    urlEl.textContent = "URL ";
    urlEl.appendChild(link);
  }

  headerCard.appendChild(titleEl);
  headerCard.appendChild(summaryEl);
  if (data.url) headerCard.appendChild(urlEl);

  container.appendChild(headerCard);

  const quiz = data.quiz || [];

  if (!Array.isArray(quiz) || quiz.length === 0) {
    const noQuizEl = document.createElement("p");
    noQuizEl.textContent = "No quiz questions were generated.";
    container.appendChild(noQuizEl);
    return;
  }

  const questionsWrapper = document.createElement("div");
  questionsWrapper.className = "questions-wrapper";

  quiz.forEach((question, index) => {
    const qCard = document.createElement("div");
    qCard.className = "card question-card";
    qCard.dataset.correctAnswer = question.answer || "";

    const qTitle = document.createElement("h3");
    qTitle.textContent = `${index + 1}. ${question.question || "Untitled question"}`;
    qCard.appendChild(qTitle);

    // options
    const optionsList = document.createElement("div");
    optionsList.className = "options-list";

    (question.options || []).forEach((opt, optIndex) => {
      const optId = `q${index}_opt${optIndex}`;

      const label = document.createElement("label");
      label.className = "option-label";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `question-${index}`;
      radio.value = opt;
      radio.id = optId;

      const spanText = document.createElement("span");
      spanText.textContent = opt;

      label.appendChild(radio);
      label.appendChild(spanText);
      optionsList.appendChild(label);
    });

    qCard.appendChild(optionsList);

    // difficulty
    if (question.difficulty) {
      const diffEl = document.createElement("span");
      diffEl.className = "difficulty-tag";
      diffEl.textContent = `Difficulty: ${question.difficulty}`;
      qCard.appendChild(diffEl);
    }

    // explanation
    const explanationEl = document.createElement("p");
    explanationEl.className = "explanation";

    // correct answer
    const correctAnswerEl = document.createElement("p");
    correctAnswerEl.className = "correct-answer";

    if (takeQuizMode) {
      // hide real text until submit
      explanationEl.textContent = "Explanation: (hidden until you submit)";
      explanationEl.dataset.actualExplanation = question.explanation || "";

      correctAnswerEl.textContent = "Correct answer: (hidden until you submit)";
      correctAnswerEl.dataset.actualAnswer = question.answer || "";

      explanationEl.style.color = "#aaa";
      correctAnswerEl.style.color = "#aaa";
    } else {
      explanationEl.textContent = question.explanation
        ? `Explanation: ${question.explanation}`
        : "";
      correctAnswerEl.textContent = question.answer
        ? `Correct answer: ${question.answer}`
        : "";
      correctAnswerEl.style.color = "lightgreen";
    }

    if (question.explanation) qCard.appendChild(explanationEl);
    if (question.answer) qCard.appendChild(correctAnswerEl);

    questionsWrapper.appendChild(qCard);
  });

  container.appendChild(questionsWrapper);

  // Submit button only in Take Quiz mode
  if (takeQuizMode) {
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit Quiz";
    submitBtn.className = "submit-quiz-btn";

    submitBtn.addEventListener("click", () => {
      handleSubmitQuiz(questionsWrapper);
    });

    container.appendChild(submitBtn);
  }
}

// ----- SUBMIT QUIZ HANDLER (TAKE QUIZ MODE) -----
function handleSubmitQuiz(questionsWrapper) {
  const questionCards = questionsWrapper.querySelectorAll(".question-card");
  let total = questionCards.length;
  let correct = 0;

  questionCards.forEach((card) => {
    const correctAnswer = card.dataset.correctAnswer || "";
    const selected = card.querySelector("input[type='radio']:checked");

    // Show the real answer & explanation
    const explanationEl = card.querySelector(".explanation");
    const correctAnswerEl = card.querySelector(".correct-answer");

    if (explanationEl && explanationEl.dataset.actualExplanation) {
      explanationEl.textContent = `Explanation: ${explanationEl.dataset.actualExplanation}`;
      explanationEl.style.color = "";
    }
    if (correctAnswerEl && correctAnswerEl.dataset.actualAnswer) {
      correctAnswerEl.textContent = `Correct answer: ${correctAnswerEl.dataset.actualAnswer}`;
      correctAnswerEl.style.color = "lightgreen";
    }

    card.classList.remove("correct-question", "incorrect-question");

    if (selected && selected.value === correctAnswer) {
      correct++;
      card.classList.add("correct-question");
    } else {
      card.classList.add("incorrect-question");
    }
  });

  alert(`You scored ${correct} out of ${total}.`);
}

// ----- GENERATE QUIZ (TAB 1) -----
async function handleGenerateQuiz() {
  const url = urlInput.value.trim();
  const takeQuizMode = takeQuizCheckbox.checked;

  if (!isValidWikipediaUrl(url)) {
    alert("Please enter a Wikipedia URL.");
    return;
  }

  clearQuizOutput();
  setStatus("Generating quiz... This may take a moment.", "info");

  try {
    const response = await fetch(`${API_BASE}/api/quizzes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = errorData.detail || "Unknown error";
      throw new Error(detail);
    }

    const data = await response.json();

    setStatus("Quiz generated successfully.", "success");
    renderQuiz(data, quizOutput, { takeQuizMode });
  } catch (err) {
    console.error(err);
    setStatus(`Error generating quiz: ${err.message}`, "error");
  }
}

generateBtn.addEventListener("click", handleGenerateQuiz);

// ----- HISTORY TAB -----
async function loadHistory() {
  historyBody.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE}/api/quizzes/`);
    if (!response.ok) {
      throw new Error("Failed to fetch quiz history");
    }

    const data = await response.json(); // array of QuizSummary

    if (!Array.isArray(data) || data.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.textContent = "No quizzes found yet.";
      row.appendChild(cell);
      historyBody.appendChild(row);
      return;
    }

    data.forEach((quiz) => {
      const row = document.createElement("tr");

      const idCell = document.createElement("td");
      idCell.textContent = quiz.id;

      const titleCell = document.createElement("td");
      titleCell.textContent = quiz.title || "";

      const urlCell = document.createElement("td");
      if (quiz.url) {
        const link = document.createElement("a");
        link.href = quiz.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Open";
        urlCell.appendChild(link);
      }

      const createdCell = document.createElement("td");
      createdCell.textContent = quiz.created_at || "";

      const detailsCell = document.createElement("td");
      const btn = document.createElement("button");
      btn.textContent = "Details";
      btn.addEventListener("click", () => openQuizDetails(quiz.id));
      detailsCell.appendChild(btn);

      row.appendChild(idCell);
      row.appendChild(titleCell);
      row.appendChild(urlCell);
      row.appendChild(createdCell);
      row.appendChild(detailsCell);

      historyBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "Error loading history.";
    row.appendChild(cell);
    historyBody.appendChild(row);
  }
}

// ----- MODAL -----
async function openQuizDetails(quizId) {
  modalBody.innerHTML = "<p>Loading...</p>";
  modal.classList.remove("hidden");

  try {
    const response = await fetch(`${API_BASE}/api/quizzes/${quizId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch quiz details");
    }
    const data = await response.json();

    renderQuiz(data, modalBody, { takeQuizMode: false }); // always show answers in modal
  } catch (err) {
    console.error(err);
    modalBody.innerHTML = `<p>Error loading quiz details: ${err.message}</p>`;
  }
}

modalClose.addEventListener("click", () => {
  modal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});
