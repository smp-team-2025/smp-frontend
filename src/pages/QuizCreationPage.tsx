import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./quiz-creation.css";

interface Question {
  id: number;
  text: string;
  correctAnswer: number | null;
}

interface Session {
  id: number;
  title: string;
  startsAt: string;
  fermiQuiz?: { id: number };
}

export default function QuizCreationPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (checkAuthAndRedirect(navigate)) {
      fetchData();
    }
  }, []);

  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const [sessionsRes, questionsRes] = await Promise.all([
        fetch("/api/events/1/sessions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/quizzes/questions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (sessionsRes.ok && questionsRes.ok) {
        setSessions(await sessionsRes.json());
        setQuestions(await questionsRes.json());
      }
    } catch (error) {
      alert("Error loading: " + error);
    } finally {
      setLoading(false);
    }
  }

  function toggleQuestion(id: number) {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter((q) => q !== id));
    } else {
      if (selectedQuestions.length >= 10) {
        alert("Maximum 10 questions allowed!");
        return;
      }
      setSelectedQuestions([...selectedQuestions, id]);
    }
  }

  async function handleCreate() {
    if (!selectedSession) {
      alert("Please select a session");
      return;
    }

    if (selectedQuestions.length !== 10) {
      alert("Exactly 10 questions must be selected!");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: selectedSession,
          questionIds: selectedQuestions,
        }),
      });

      if (res.ok) {
        alert("Quiz created successfully!");
        navigate("/quizlist");
      } else {
        const data = await res.json();
        alert(data.error || "Error creating quiz");
      }
    } catch (error) {
      alert("Error: " + error);
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="container">Loading...</div>;

  const availableSessions = sessions.filter((s) => !s.fermiQuiz);

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <span className="logo">SMP 2026</span>
        <div className="nav-right">
          <button onClick={() => navigate("/ohomepage")} className="back-btn">
            ← Dashboard
          </button>
          <button onClick={() => navigate("/login")} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="container">
        <h1>Create Fermi Quiz</h1>

        <div className="creation-steps">
          <div className="step">
            <h2>1. Select Session</h2>
            {availableSessions.length === 0 ? (
              <p className="empty-state">
                All sessions already have a quiz. Please create a new session.
              </p>
            ) : (
              <div className="sessions-list">
                {availableSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`session-card ${selectedSession === session.id ? "selected" : ""}`}
                    onClick={() => setSelectedSession(session.id)}
                  >
                    <h3>{session.title}</h3>
                    <p>{new Date(session.startsAt).toLocaleDateString("de-DE")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="step">
            <h2>
              2. Select 10 Questions ({selectedQuestions.length}/10)
            </h2>
            {questions.length < 10 ? (
              <p className="warning">
                At least 10 questions required. Current: {questions.length} questions.
                <br />
                <button onClick={() => navigate("/questions")} className="btn-link">
                  → Go to Question Management
                </button>
              </p>
            ) : (
              <div className="questions-list">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className={`question-item ${
                      selectedQuestions.includes(q.id) ? "selected" : ""
                    }`}
                    onClick={() => toggleQuestion(q.id)}
                  >
                    <div className="checkbox">
                      {selectedQuestions.includes(q.id) && "✓"}
                    </div>
                    <div className="question-text">{q.text}</div>
                    {q.correctAnswer !== null && (
                      <div className="answer-badge">
                        {q.correctAnswer.toExponential(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="step">
            <button
              onClick={handleCreate}
              className="btn-create"
              disabled={
                !selectedSession ||
                selectedQuestions.length !== 10 ||
                creating
              }
            >
              {creating ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
