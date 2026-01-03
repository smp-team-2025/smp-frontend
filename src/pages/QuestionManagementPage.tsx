import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./question-management.css";

interface Question {
  id: number;
  text: string;
  correctAnswer: number | null;
}

export default function QuestionManagementPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState({ text: "", correctAnswer: "" });
  const [editQuestion, setEditQuestion] = useState({ text: "", correctAnswer: "" });

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
      alert("Error loading: " + error);
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
          correctAnswer: newQuestion.correctAnswer ? parseFloat(newQuestion.correctAnswer) : null,
        }),
      });

      if (res.ok) {
        setNewQuestion({ text: "", correctAnswer: "" });
        fetchQuestions();
      } else {
        alert("Error creating question");
      }
    } catch (error) {
      alert("Error: " + error);
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
          correctAnswer: editQuestion.correctAnswer ? parseFloat(editQuestion.correctAnswer) : null,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchQuestions();
      } else {
        alert("Error updating question");
      }
    } catch (error) {
      alert("Error: " + error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/quizzes/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchQuestions();
      } else {
        alert("Error deleting question");
      }
    } catch (error) {
      alert("Error: " + error);
    }
  }

  function startEdit(question: Question) {
    setEditingId(question.id);
    setEditQuestion({
      text: question.text,
      correctAnswer: question.correctAnswer?.toString() || "",
    });
  }

  if (loading) return <div className="container">Loading...</div>;

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
        <h1>Fermi Question Management</h1>

        <div className="create-section">
          <h2>Create New Question</h2>
          <form onSubmit={handleCreate} className="question-form">
            <div className="form-group">
              <label>Question Text</label>
              <textarea
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                placeholder="e.g. How many stars are in the universe?"
                required
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Correct Answer (optional)</label>
              <input
                type="number"
                step="any"
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                placeholder="e.g. 1e24"
              />
            </div>
            <button type="submit" className="btn-primary">
              Create Question
            </button>
          </form>
        </div>

        <div className="questions-list">
          <h2>Question Bank ({questions.length} Questions)</h2>
          {questions.length === 0 ? (
            <p className="empty-state">No questions available</p>
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
                        placeholder="Correct Answer"
                      />
                      <div className="btn-group">
                        <button onClick={() => handleUpdate(q.id)} className="btn-save">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn-cancel">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="question-text">{q.text}</div>
                      {q.correctAnswer !== null && (
                        <div className="correct-answer-badge">
                          Answer: {q.correctAnswer.toExponential(2)}
                        </div>
                      )}
                      <div className="btn-group">
                        <button onClick={() => startEdit(q)} className="btn-edit">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="btn-delete">
                          Delete
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
