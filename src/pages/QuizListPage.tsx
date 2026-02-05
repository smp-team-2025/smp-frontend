import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./quizlist.css";
import { getActiveEvent } from "../api/event";

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
      const headers: HeadersInit = { Authorization: `Bearer ${token}` };

      const active = await getActiveEvent(headers);

      const res = await fetch(`/api/events/${active.id}/sessions`, { headers });
      if (res.ok) {
        const data = (await res.json()) as Session[];
        const sessionsWithQuiz = data.filter((s) => s.fermiQuiz);
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
              <div key={session.id} className="card" style={{ position: "relative" }}>
                <h2>{session.title}</h2>
                <p>{new Date(session.startsAt).toLocaleDateString("de-DE")}</p>

                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <Link
                    to={`/quiz/${session.fermiQuiz!.id}/results`}
                    style={{
                      flex: 1,
                      padding: "10px",
                      backgroundColor: "#3a7bd5",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "6px",
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    Statistics
                  </Link>

                  <Link
                    to={`/quiz/${session.fermiQuiz!.id}/leaderboard`}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "6px",
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    🏆 Leaderboard
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}