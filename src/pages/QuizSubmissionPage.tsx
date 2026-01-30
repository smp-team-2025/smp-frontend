import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./quiz.css";

interface Question {
  id: number;
  questionId: number;
  order: number;
  question: {
    id: number;
    text: string;
  };
}

interface Quiz {
  id: number;
  sessionId: number;
  questions: Question[];
}

export default function QuizSubmissionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; answer: number }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes total
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (checkAuthAndRedirect(navigate)) {
      fetchQuiz();
    }
  }, [sessionId]);

  useEffect(() => {
    if (!quiz || submitting) return;

    if (timeLeft <= 0) {
      // Time's up - auto submit
      submitQuiz(answers);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, submitting, timeLeft]);

  async function fetchQuiz() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/quizzes/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        alert("Quiz not found");
        navigate("/studenthomepage");
      }
    } catch (error) {
      alert("Error loading: " + error);
    } finally {
      setLoading(false);
    }
  }

  function saveCurrentAnswer() {
    if (!quiz || currentAnswer === null) return;

    const currentQ = quiz.questions[currentQuestionIndex];

    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(
      (a) => a.questionId === currentQ.question.id
    );

    if (existingIndex >= 0) {
      newAnswers[existingIndex].answer = currentAnswer;
    } else {
      newAnswers.push({
        questionId: currentQ.question.id,
        answer: currentAnswer,
      });
    }

    setAnswers(newAnswers);
    return newAnswers;
  }

  function handleNext() {
    if (!quiz) return;

    const savedAnswers = saveCurrentAnswer();

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Load answer if previously answered
      const nextQ = quiz.questions[currentQuestionIndex + 1];
      const existingAnswer = savedAnswers?.find(a => a.questionId === nextQ.question.id);
      setCurrentAnswer(existingAnswer ? existingAnswer.answer : null);
    } else {
      submitQuiz(savedAnswers || answers);
    }
  }

  function handlePrevious() {
    if (!quiz || currentQuestionIndex === 0) return;

    saveCurrentAnswer();

    setCurrentQuestionIndex(currentQuestionIndex - 1);
    // Load previous answer
    const prevQ = quiz.questions[currentQuestionIndex - 1];
    const existingAnswer = answers.find(a => a.questionId === prevQ.question.id);
    setCurrentAnswer(existingAnswer ? existingAnswer.answer : null);
  }

  async function submitQuiz(finalAnswers: { questionId: number; answer: number }[]) {
    if (!quiz) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      if (res.ok) {
        alert("Quiz submitted successfully!");
        navigate("/studenthomepage");
      } else {
        const data = await res.json();
        alert(data.error || "Error submitting quiz");
        setSubmitting(false);
      }
    } catch (error) {
      alert("Error: " + error);
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="quiz-container">Loading...</div>;
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="quiz-container">
        <p>No quiz available</p>
        <button onClick={() => navigate("/studenthomepage")}>Back</button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>Fermi Quiz</h1>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="question-counter">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </p>
      </div>

      <div className="timer">
        <div className={`timer-circle ${timeLeft <= 60 ? "warning" : ""}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        <p style={{ textAlign: "center", marginTop: "10px", color: "#666", fontSize: "14px" }}>
          Time remaining
        </p>
      </div>

      <div className="question-card">
        <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "#333", lineHeight: "1.5" }}>
          {currentQ.question.text}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          className="quiz-form"
        >
          <label>Your Answer (Power of 10)</label>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
            Select the exponent: 10^n where n is between -50 and 50
          </p>
          <select
            value={currentAnswer !== null ? currentAnswer : ""}
            onChange={(e) => setCurrentAnswer(e.target.value ? parseInt(e.target.value) : null)}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px 15px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "2px solid #e0e0e0",
              backgroundColor: "#fff",
              cursor: "pointer",
              outline: "none",
              color: "#333"
            }}
          >
            <option value="">-- Select exponent --</option>
            {Array.from({ length: 101 }, (_, i) => i - 50).map((n) => (
              <option key={n} value={n}>
                10^{n} {n === 0 ? "(= 1)" : n === 1 ? "(= 10)" : n === 2 ? "(= 100)" : n === 3 ? "(= 1000)" : n === -1 ? "(= 0.1)" : n === -2 ? "(= 0.01)" : ""}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={handlePrevious}
              className="btn-secondary"
              disabled={currentQuestionIndex === 0 || submitting}
              style={{ flex: 1 }}
            >
              ← Previous
            </button>

            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
              style={{ flex: 2 }}
            >
              {currentQuestionIndex === quiz.questions.length - 1
                ? submitting
                  ? "Submitting Quiz..."
                  : "Submit Quiz"
                : "Next →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
