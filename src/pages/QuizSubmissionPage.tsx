import { useState, useEffect } from "react";
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
  timerStartedAt: string | null;
  timerDurationMinutes: number | null;
  questions: Question[];
}

export default function QuizSubmissionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; answer: number | null }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [alertShown, setAlertShown] = useState(false);

  useEffect(() => {
    if (checkAuthAndRedirect(navigate)) {
      fetchQuiz();
    }
  }, [sessionId]);

  // Polling to check timer status every 5 seconds
  useEffect(() => {
    if (!quiz || submitting) return;

    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/quizzes/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          updateTimerFromQuiz(data);
        }
      } catch (error) {
        console.error("Error polling quiz:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [quiz, submitting, sessionId]);

  // Countdown timer (runs every second)
  useEffect(() => {
    if (!quiz || submitting || timeLeft === null) return;

    if (timeLeft <= 0) {
      // Time's up - auto submit with all answers (fill missing with null for 8 points penalty)
      setSubmitting(true); // Set this BEFORE alert to prevent loop

      const allAnswers = quiz.questions.map((q) => {
        const existingAnswer = answers.find(a => a.questionId === q.question.id);
        return {
          questionId: q.question.id,
          answer: existingAnswer ? existingAnswer.answer : null
        };
      });

      alert("Time's up! Submitting your quiz...");
      submitQuiz(allAnswers);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, submitting, timeLeft, answers]);

  async function fetchQuiz() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/quizzes/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
        updateTimerFromQuiz(data);
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

  function updateTimerFromQuiz(quizData: Quiz) {
    if (!quizData.timerStartedAt || !quizData.timerDurationMinutes) {
      // Timer not started yet
      setTimeLeft(null);
      setTimerStarted(false);
      return;
    }

    // Calculate remaining time
    const startedAt = new Date(quizData.timerStartedAt).getTime();
    const durationMs = quizData.timerDurationMinutes * 60 * 1000;
    const endTime = startedAt + durationMs;
    const now = Date.now();
    const remainingMs = endTime - now;
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

    // Check if alert already shown for this quiz
    const alertKey = `timer-alert-shown-${quizData.id}`;
    const alreadyShown = localStorage.getItem(alertKey) === 'true';

    // Show alert ONLY once when timer first starts
    if (!timerStarted && !alreadyShown && remainingSeconds > 0) {
      alert(`Timer started! You have ${quizData.timerDurationMinutes} minutes to complete the quiz.`);
      setTimerStarted(true);
      setAlertShown(true);
      localStorage.setItem(alertKey, 'true');
    } else if (!timerStarted && remainingSeconds > 0) {
      // Timer started but alert already shown
      setTimerStarted(true);
      setAlertShown(true);
    }

    setTimeLeft(remainingSeconds);
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

  async function submitQuiz(finalAnswers: { questionId: number; answer: number | null }[]) {
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
        // If time is up and submit failed, redirect to home to avoid loop
        if (timeLeft !== null && timeLeft <= 0) {
          navigate("/studenthomepage");
        } else {
          setSubmitting(false);
        }
      }
    } catch (error) {
      alert("Error: " + error);
      // If time is up and submit failed, redirect to home to avoid loop
      if (timeLeft !== null && timeLeft <= 0) {
        navigate("/studenthomepage");
      } else {
        setSubmitting(false);
      }
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

  // Handle timer display
  let minutes = 0;
  let seconds = 0;
  if (timeLeft !== null) {
    minutes = Math.floor(timeLeft / 60);
    seconds = timeLeft % 60;
  }

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

      {timeLeft !== null && (
        <div className="timer">
          <div className={`timer-circle ${timeLeft <= 60 ? "warning" : ""}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <p style={{ textAlign: "center", marginTop: "10px", color: "#666", fontSize: "14px" }}>
            Time remaining
          </p>
        </div>
      )}

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
                {n}
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
