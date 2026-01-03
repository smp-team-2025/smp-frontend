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
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (checkAuthAndRedirect(navigate)) {
      fetchQuiz();
    }
  }, [sessionId]);

  useEffect(() => {
    if (!quiz || submitting || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, quiz, submitting, timeLeft]);

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

  function handleNext() {
    if (!quiz) return;

    const currentQ = quiz.questions[currentQuestionIndex];
    const answerValue = parseFloat(currentAnswer) || 0;

    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(
      (a) => a.questionId === currentQ.question.id
    );

    if (existingIndex >= 0) {
      newAnswers[existingIndex].answer = answerValue;
    } else {
      newAnswers.push({
        questionId: currentQ.question.id,
        answer: answerValue,
      });
    }

    setAnswers(newAnswers);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentAnswer("");
      setTimeLeft(60);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz(newAnswers);
    }
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
        <div className={`timer-circle ${timeLeft <= 10 ? "warning" : ""}`}>
          {timeLeft}s
        </div>
        <p style={{ textAlign: "center", marginTop: "10px", color: "#666", fontSize: "14px" }}>
          Time remaining
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
        className="quiz-form"
      >
        <label>Your Answer (Number / Power of 10)</label>
        <input
          type="number"
          step="any"
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="e.g. 100 or 1e6"
          required
          autoFocus
          disabled={submitting}
        />

        <button type="submit" className="btn-submit" disabled={submitting}>
          {currentQuestionIndex === quiz.questions.length - 1
            ? submitting
              ? "Submitting Quiz..."
              : "Submit Quiz"
            : "Submit Answer →"}
        </button>
      </form>
    </div>
  );
}
