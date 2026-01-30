import { useEffect, useState } from "react";
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

export default function StudentQuizSessionsPage() {
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
          <Link to="/studenthomepage" className="back-btn">
            ← Dashboard
          </Link>

          <Link to="/login" className="logout-btn">
            Logout
          </Link>
        </div>
      </header>

      <main className="container">
        <h1>Fermi Quiz Sessions</h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          Select a session to participate in the quiz
        </p>

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
                to={`/quiz/session/${session.id}`}
                className="card"
                style={{ textDecoration: "none" }}
              >
                <h2>{session.title}</h2>
                <p>{new Date(session.startsAt).toLocaleDateString("de-DE")}</p>
                <p style={{
                  marginTop: "15px",
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontWeight: "500"
                }}>
                  Start Quiz →
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
