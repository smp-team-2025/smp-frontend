import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveEvent } from "../api/event";
import "./studentsessionscalendar.css";

interface Session {
  id: number;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
}

interface DateGroup {
  dateKey: string;
  displayDate: string;
  sessions: Session[];
}

export default function StudentSessionsCalendar() {
  const navigate = useNavigate();
  const [groupedSessions, setGroupedSessions] = useState<DateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError("");

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

      if (!res.ok) {
        setError("Failed to load sessions.");
        setGroupedSessions([]);
        return;
      }

      const data: Session[] = await res.json();
      const groups = groupSessionsByDate(data);
      setGroupedSessions(groups);
    } catch (err) {
      console.error(err);
      setError("Failed to load sessions.");
      setGroupedSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const groupSessionsByDate = (sessions: Session[]) => {
    const groups: { [key: string]: DateGroup } = {};

    sessions.forEach((session) => {
      const dateObj = new Date(session.startsAt);
      const dateKey = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD for sorting
      const displayDate = dateObj.toLocaleDateString("de-DE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!groups[dateKey]) {
        groups[dateKey] = { dateKey, displayDate, sessions: [] };
      }
      groups[dateKey].sessions.push(session);
    });

    return Object.values(groups).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  };

  const formatTime = (start: string, end?: string | null) => {
    const startTime = new Date(start).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (!end) return startTime;
    const endTime = new Date(end).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <div className="nav-left">
          <span className="logo">SMP 2026</span>
        </div>
        <button
          onClick={() => navigate("/studenthomepage")}
          className="back-btn"
          style={{ border: "none", cursor: "pointer" }}
        >
          ← Dashboard
        </button>
      </header>

      <main className="container">
        <h1>Session Calendar</h1>

        {loading && <p>Loading calendar...</p>}
        {error && <p className="error-msg">{error}</p>}
        {!loading && !error && groupedSessions.length === 0 && <p>No sessions found</p>}

        <div className="calendar-list">
          {groupedSessions.map((group) => (
            <div key={group.dateKey} className="date-group">
              <h3 className="date-header">{group.displayDate}</h3>
              <div className="sessions-grid">
                {group.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="calendar-card"
                    title={session.description || ""}
                  >
                    <div className="time-badge">
                      {formatTime(session.startsAt, session.endsAt)}
                    </div>
                    <h4 className="session-title">{session.title}</h4>
                    <div className="session-location">
                      📍 {session.location || "TBA"}
                    </div>
                    {session.description && (
                      <p style={{ fontSize: "0.9rem", color: "#555", marginTop: "8px" }}>
                        {session.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}