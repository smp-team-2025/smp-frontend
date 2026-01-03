import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./quizlist.css";

interface Session {
  id: number;
  title: string;
  startsAt: string;
  fermiQuiz?: {
    id: number;
  };
}

export default function QuizListPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checkAuthAndRedirect(navigate)) {
      fetchSessions();
    }
  }, []);

  async function fetchSessions() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/events/1/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const sessionsWithQuiz = data.filter((s: Session) => s.fermiQuiz);
        setSessions(sessionsWithQuiz);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <span className="logo">SMP 2026</span>

        <div className="nav-right">
          <Link to="/ohomepage" className="back-btn">
            ← Dashboard
          </Link>

          <Link to="/login" className="logout-btn">
            Logout
          </Link>
        </div>
      </header>

      <main className="container">
        <h1>Fermi Quiz Results</h1>

        {loading ? (
          <p style={{ textAlign: "center", marginTop: "40px" }}>Loading...</p>
        ) : sessions.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
            No quiz sessions available
          </p>
        ) : (
          <div className="cards">
            {sessions.map((session) => (
              <Link
                key={session.id}
                to={`/quiz/${session.fermiQuiz!.id}/results`}
                className="card"
              >
                <h2>{session.title}</h2>
                <p>{new Date(session.startsAt).toLocaleDateString("de-DE")}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
