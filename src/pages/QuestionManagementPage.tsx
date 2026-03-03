import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./question-management.css";

interface Question {
  id: number;
  text: string;
  correctAnswer: number | null;
  correctAnswer2: number | null;
}

export default function QuestionManagementPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState({ text: "", correctAnswer: "", correctAnswer2: "" });
  const [editQuestion, setEditQuestion] = useState({ text: "", correctAnswer: "", correctAnswer2: "" });

  useEffect(() => {
    if (checkAuthAndRedirect(navigate)) {
      fetchQuestions();
    }
  }, []);

  async function fetchQuestions() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/quizzes/questions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setQuestions(await res.json());
      }
    } catch (error) {
      alert("Fehler beim Laden: " + error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/quizzes/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newQuestion.text,
          correctAnswer: newQuestion.correctAnswer ? parseInt(newQuestion.correctAnswer) : null,
          correctAnswer2: newQuestion.correctAnswer2 ? parseInt(newQuestion.correctAnswer2) : null,
        }),
      });

      if (res.ok) {
        setNewQuestion({ text: "", correctAnswer: "", correctAnswer2: "" });
        fetchQuestions();
      } else {
        alert("Fehler beim Erstellen der Frage");
      }
    } catch (error) {
      alert("Fehler: " + error);
    }
  }

  async function handleUpdate(id: number) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/quizzes/questions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: editQuestion.text,
          correctAnswer: editQuestion.correctAnswer ? parseInt(editQuestion.correctAnswer) : null,
          correctAnswer2: editQuestion.correctAnswer2 ? parseInt(editQuestion.correctAnswer2) : null,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchQuestions();
      } else {
        alert("Fehler beim Aktualisieren der Frage");
      }
    } catch (error) {
      alert("Fehler: " + error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Möchten Sie diese Frage wirklich löschen?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/quizzes/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchQuestions();
      } else {
        alert("Fehler beim Löschen der Frage");
      }
    } catch (error) {
      alert("Fehler: " + error);
    }
  }

  function startEdit(question: Question) {
    setEditingId(question.id);
    setEditQuestion({
      text: question.text,
      correctAnswer: question.correctAnswer?.toString() || "",
      correctAnswer2: question.correctAnswer2?.toString() || "",
    });
  }

  if (loading) return <div className="container">Lädt...</div>;

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
        <h1>Fermi Fragenverwaltung</h1>

        <div className="create-section">
          <h2>Neue Frage erstellen</h2>
          <form onSubmit={handleCreate} className="question-form">
            <div className="form-group">
              <label>Fragetext</label>
              <textarea
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                placeholder="z.B. Wie viele Sterne gibt es im Universum?"
                required
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Richtige Antwort (Zehnerpotenz: -50 bis 50)</label>
              <input
                type="number"
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                placeholder="z.B. 3 für 10^3 = 1000"
                min="-50"
                max="50"
              />
            </div>
            <div className="form-group">
              <label>Zweite richtige Antwort (optional, für Bereich)</label>
              <input
                type="number"
                value={newQuestion.correctAnswer2}
                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer2: e.target.value })}
                placeholder="z.B. 4 für 10^4 = 10000"
                min="-50"
                max="50"
              />
              <small style={{ color: "#666", fontSize: "12px" }}>
                Verwenden Sie dies, wenn zwei benachbarte Antworten akzeptabel sind (z.B. sowohl 3 als auch 4)
              </small>
            </div>
            <button type="submit" className="btn-primary">
              Frage erstellen
            </button>
          </form>
        </div>

        <div className="questions-list">
          <h2>Fragenbank ({questions.length} Fragen)</h2>
          {questions.length === 0 ? (
            <p className="empty-state">Keine Fragen verfügbar</p>
          ) : (
            <div className="questions-grid">
              {questions.map((q) => (
                <div key={q.id} className="question-card">
                  {editingId === q.id ? (
                    <div className="edit-mode">
                      <textarea
                        value={editQuestion.text}
                        onChange={(e) => setEditQuestion({ ...editQuestion, text: e.target.value })}
                        rows={3}
                      />
                      <input
                        type="number"
                        step="any"
                        value={editQuestion.correctAnswer}
                        onChange={(e) => setEditQuestion({ ...editQuestion, correctAnswer: e.target.value })}
                        placeholder="Richtige Antwort"
                      />
                      <div className="btn-group">
                        <button onClick={() => handleUpdate(q.id)} className="btn-save">
                          Speichern
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn-cancel">
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="question-text">{q.text}</div>
                      {q.correctAnswer !== null && (
                        <div className="correct-answer-badge">
                          Antwort: {q.correctAnswer.toExponential(2)}
                        </div>
                      )}
                      <div className="btn-group">
                        <button onClick={() => startEdit(q)} className="btn-edit">
                          Bearbeiten
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="btn-delete">
                          Löschen
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
