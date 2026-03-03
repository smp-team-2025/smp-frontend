import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import { getActiveEvent } from "../api/event";
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
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // active event
      const activeEvent = await getActiveEvent(headers);

      // sessions for active event
      const res = await fetch(`/api/events/${activeEvent.id}/sessions`, { headers });

      if (!res.ok) {
        console.error("Failed to fetch sessions", res.status);
        setSessions([]);
        return;
      }

      const data: Session[] = await res.json();
      const sessionsWithQuiz = data.filter((s) => s.fermiQuiz);
      setSessions(sessionsWithQuiz);
    } catch (error) {
      console.error(error);
      setSessions([]);
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
          Wählen Sie eine Session aus, um am Quiz teilzunehmen
        </p>

        {loading ? (
          <p style={{ textAlign: "center", marginTop: "40px" }}>Lädt...</p>
        ) : sessions.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
            Keine Quiz-Sessions verfügbar
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
                <p
                  style={{
                    marginTop: "15px",
                    padding: "8px 16px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    borderRadius: "6px",
                    textAlign: "center",
                    fontWeight: "500",
                  }}
                >
                  Quiz starten →
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}