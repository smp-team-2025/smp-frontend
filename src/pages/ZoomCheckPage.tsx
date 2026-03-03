import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveEvent } from "../api/event";
import "./zoomcheckpage.css";

interface UnmatchedParticipant {
  id: number;
  displayName: string;
  email: string | null;
  durationMin: number | null;
}

interface Session {
  id: number;
  title: string;
  startsAt: string;
  endsAt?: string | null;
}

export default function ZoomCheckPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [participants, setParticipants] = useState<UnmatchedParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchSessions();
  }, [navigate]);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // active event
      const ev = await getActiveEvent(headers);

      // sessions for active event
      const res = await fetch(`/api/events/${ev.id}/sessions`, { headers });

      if (res.ok) {
        const data: Session[] = await res.json();
        const sortedSessions = data.sort(
          (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
        );
        setSessions(sortedSessions);
      } else {
        setError("Sessions konnten nicht geladen werden.");
        setSessions([]);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setError("Sessions konnten nicht geladen werden.");
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSessionId) {
      setError("Bitte wählen Sie eine Session aus.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(false);
    setParticipants([]);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(
        `/api/attendance/sessions/${selectedSessionId}/zoom-unmatched`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
        setSearched(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Daten konnten nicht abgerufen werden.");
      }
    } catch (err) {
      setError("Beim Abrufen der Daten ist ein Fehler aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  const formatSessionLabel = (session: Session) => {
    const date = new Date(session.startsAt).toLocaleDateString("de-DE");
    const time = new Date(session.startsAt).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${session.title} - ${date} ${time}`;
  };

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <div className="nav-left">
          <span className="logo">SMP 2026</span>
        </div>
        <button
          onClick={() => navigate("/ohomepage")}
          className="logout-btn"
          style={{ border: "none", cursor: "pointer" }}
        >
          ← Dashboard
        </button>
      </header>

      <main className="container">
        <h1>Nicht zugeordnete Zoom-Teilnehmer prüfen</h1>
        <div className="check-card">
          <p>
            Wählen Sie eine Session aus, um Teilnehmer aus der Zoom-CSV anzuzeigen,
            die keinem registrierten Benutzer zugeordnet werden konnten.
          </p>

          {loadingSessions ? (
            <p>Sessions werden geladen...</p>
          ) : (
            <form onSubmit={handleCheck} className="check-form">
              <div className="form-group">
                <label htmlFor="sessionSelect">Session auswählen</label>
                <div className="input-row">
                  <select
                    id="sessionSelect"
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      padding: "0.8rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">-- Session auswählen --</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {formatSessionLabel(session)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="check-btn"
                    disabled={loading || !selectedSessionId}
                  >
                    {loading ? "Prüfe..." : "Prüfen"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {error && <div className="status-message error">{error}</div>}

          {searched && participants.length === 0 && !error && (
            <div className="status-message success">
              Keine nicht zugeordneten Teilnehmer für diese Session gefunden.
            </div>
          )}

          {participants.length > 0 && (
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Anzeigename</th>
                    <th>E-Mail</th>
                    <th>Dauer (Min.)</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id}>
                      <td>{p.displayName}</td>
                      <td>{p.email || "-"}</td>
                      <td>{p.durationMin || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}