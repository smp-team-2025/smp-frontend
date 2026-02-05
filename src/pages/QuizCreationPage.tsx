import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./quiz-creation.css";
import { getActiveEvent } from "../api/event";

interface Question {
  id: number;
  text: string;
  correctAnswer: number | null;
  correctAnswer2: number | null;
  usedIn?: Array<{
    quizId: number;
    sessionId: number;
    sessionTitle: string;
  }>;
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
      const headers: HeadersInit = { Authorization: `Bearer ${token}` };

      //active event
      const active = await getActiveEvent(headers);

      const [sessionsRes, questionsRes] = await Promise.all([
        fetch(`/api/events/${active.id}/sessions`, { headers }),
        fetch("/api/quizzes/questions", { headers }),
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

  function moveQuestionUp(index: number) {
    if (index === 0) return;
    const newOrder = [...selectedQuestions];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSelectedQuestions(newOrder);
  }

  function moveQuestionDown(index: number) {
    if (index === selectedQuestions.length - 1) return;
    const newOrder = [...selectedQuestions];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSelectedQuestions(newOrder);
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
            <h2>2. Select 10 Questions ({selectedQuestions.length}/10)</h2>
            {questions.length < 10 ? (
              <p className="warning">
                At least 10 questions required. Current: {questions.length} questions.
                <br />
                <button onClick={() => navigate("/questions")} className="btn-link">
                  → Go to Question Management
                </button>
              </p>
            ) : (
              <div className="questions-selection">
                <div className="available-questions">
                  <h3>Available Questions</h3>
                  <div className="questions-list">
                    {questions
                      .filter((q) => !selectedQuestions.includes(q.id))
                      .map((q) => (
                        <div
                          key={q.id}
                          className="question-item"
                          onClick={() => toggleQuestion(q.id)}
                        >
                          <div className="checkbox"></div>
                          <div style={{ flex: 1 }}>
                            <div className="question-text">{q.text}</div>
                            {q.usedIn && q.usedIn.length > 0 && (
                              <div style={{ marginTop: "5px", fontSize: "11px", color: "#ff6b6b" }}>
                                ⚠️ Used in: {q.usedIn.map((u) => u.sessionTitle).join(", ")}
                              </div>
                            )}
                          </div>
                          {q.correctAnswer !== null && (
                            <div className="answer-badge">10^{q.correctAnswer}</div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="selected-questions">
                  <h3>Selected Questions (Order matters!)</h3>
                  {selectedQuestions.length === 0 ? (
                    <p className="empty-state">Click questions to select them</p>
                  ) : (
                    <div className="ordered-list">
                      {selectedQuestions.map((qId, index) => {
                        const question = questions.find((q) => q.id === qId);
                        if (!question) return null;
                        return (
                          <div key={qId} className="ordered-question-item">
                            <div className="order-number">{index + 1}</div>
                            <div className="question-text">{question.text}</div>
                            <div className="controls">
                              <button
                                onClick={() => moveQuestionUp(index)}
                                disabled={index === 0}
                                className="btn-arrow"
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveQuestionDown(index)}
                                disabled={index === selectedQuestions.length - 1}
                                className="btn-arrow"
                                title="Move down"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => toggleQuestion(qId)}
                                className="btn-remove"
                                title="Remove"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="step">
            <button
              onClick={handleCreate}
              className="btn-create"
              disabled={!selectedSession || selectedQuestions.length !== 10 || creating}
            >
              {creating ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}