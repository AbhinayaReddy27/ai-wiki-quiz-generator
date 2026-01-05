export const MOCK_QUIZ = {
  id: "quiz-123",
  title: "Alan Turing",
  url: "https://en.wikipedia.org/wiki/Alan_Turing",
  summary: "Alan Mathison Turing OBE FRS was an English mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist. Turing was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the Turing machine, which can be considered a model of a general-purpose computer.",
  sections: ["Early Life", "Cryptanalysis", "Turing Machine", "Legacy"],
  entities: ["Enigma Machine", "Bletchley Park", "University of Manchester", "Artificial Intelligence", "Christopher Morcom"],
  relatedTopics: ["Computer Science", "World War II", "Cryptography", "Ada Lovelace", "John von Neumann", "Enigma Machine", "Halting Problem"],
  questions: [
    {
      id: 1,
      question: "Which concept did Turing propose as a model of a general-purpose computer?",
      options: ["Turing Machine", "Difference Engine", "Analytical Engine", "Quantum Computer"],
      correct: "Turing Machine",
      difficulty: "medium",
      explanation: "The Turing machine is a mathematical model of computation describing an abstract machine that manipulates symbols on a strip of tape according to a table of rules."
    },
    {
      id: 2,
      question: "During World War II, where did Turing work on breaking German ciphers?",
      options: ["Bletchley Park", "Pentagon", "GCHQ", "MI6 Headquarters"],
      correct: "Bletchley Park",
      difficulty: "easy",
      explanation: "Turing worked at Bletchley Park, Britain's codebreaking centre, where he led the Hut 8 section responsible for German naval cryptanalysis."
    },
    {
      id: 3,
      question: "What was the name of the electromechanical machine Turing designed to find Enigma settings?",
      options: ["The Bombe", "The Colossus", "The Enigma", "The Ace"],
      correct: "The Bombe",
      difficulty: "hard",
      explanation: "The Bombe was an electromechanical device used by British cryptologists to help decipher German Enigma-machine-encrypted secret messages."
    },
    {
      id: 4,
      question: "Which famous test did Turing introduce to determine if a machine exhibits intelligent behavior?",
      options: ["The Turing Test", "The IQ Test", "The Voight-Kampff Test", "The Lovelace Test"],
      correct: "The Turing Test",
      difficulty: "easy",
      explanation: "The Turing test, originally called the imitation game by Turing, is a test of a machine's ability to exhibit intelligent behaviour equivalent to, or indistinguishable from, that of a human."
    },
    {
      id: 5,
      question: "In which year was Alan Turing prosecuted for homosexual acts?",
      options: ["1952", "1945", "1960", "1939"],
      correct: "1952",
      difficulty: "medium",
      explanation: "Turing was prosecuted in 1952 for homosexual acts. He accepted chemical castration treatment as an alternative to prison."
    }
  ],
  created_at: new Date().toISOString()
};

export const MOCK_HISTORY = [
  {
    id: "quiz-123",
    title: "Alan Turing",
    url: "https://en.wikipedia.org/wiki/Alan_Turing",
    created_at: "2024-01-15T14:30:00Z",
    questionCount: 5
  },
  {
    id: "quiz-456",
    title: "Photosynthesis",
    url: "https://en.wikipedia.org/wiki/Photosynthesis",
    created_at: "2024-01-14T09:15:00Z",
    questionCount: 8
  },
  {
    id: "quiz-789",
    title: "Renaissance Art",
    url: "https://en.wikipedia.org/wiki/Renaissance_art",
    created_at: "2024-01-12T16:45:00Z",
    questionCount: 6
  }
];
