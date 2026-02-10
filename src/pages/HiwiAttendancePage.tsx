import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { hiwiApi } from "../api/hiwi";
import { getActiveEvent } from "../api/event";
import "./hiwiattendance.css";

type AttendanceStatus = "YES" | "NO" | "MAYBE";

type SessionItem = {
  id: number;
  session: {
    id: number;
    title: string;
    startsAt: string;
    location?: string | null;
    event?: { id: number };
  };
};

type AttendanceItem = {
  sessionId: number;
  status: AttendanceStatus;
};

export default function HiwiAttendancePage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [statusMap, setStatusMap] = useState<Record<number, AttendanceStatus>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const activeEvent = await getActiveEvent(headers);

      // 1️⃣ HiWi'ye atanmış session'lar
      const mySessions = await hiwiApi.getMySessions();
      const filteredSessions = mySessions.filter(
        (s: SessionItem) => s.session?.event?.id === activeEvent.id
      );
      setSessions(filteredSessions);

      // 2️⃣ Daha önce girilmiş availability bilgileri
      const attendance: AttendanceItem[] = await fetch(
        `/api/events/${activeEvent.id}/my-hiwi-attendance`,
        { headers }
      ).then((r) => r.json());

      const map: Record<number, AttendanceStatus> = {};
      attendance.forEach((a) => {
        map[a.sessionId] = a.status;
      });
      setStatusMap(map);
    } finally {
      setLoading(false);
    }
  }

  async function saveAttendance(
    sessionId: number,
    status: AttendanceStatus
  ) {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(`/api/sessions/${sessionId}/hiwi-attendance`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    setStatusMap((prev) => ({ ...prev, [sessionId]: status }));
  }

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <span className="logo">SMP 2026</span>
        <Link to="/hiwihomepage" className="logout-btn">
          ← Dashboard
        </Link>
      </header>

      <main className="container">
        <h1>Meine Verfügbarkeit</h1>

        <p className="hint">
          Bitte gib an, ob du bei den folgenden Sessions verfügbar bist.
          Deine Angaben sind unverbindlich und können jederzeit geändert werden.
        </p>

        {loading && <p>Lädt…</p>}

        {!loading && sessions.length === 0 && (
          <p>
            Für das aktive Event sind aktuell keine Sessions vorhanden.
          </p>
        )}

        <div className="cards">
          {sessions.map((s) => (
            <div key={s.session.id} className="card">
              <h2>{s.session.title}</h2>

              <p>
                🕒{" "}
                {new Date(s.session.startsAt).toLocaleString("de-DE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>

              <p>📍 {s.session.location || "TBA"}</p>

              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    checked={statusMap[s.session.id] === "YES"}
                    onChange={() =>
                      saveAttendance(s.session.id, "YES")
                    }
                  />
                  Dabei
                </label>

                <label>
                  <input
                    type="radio"
                    checked={statusMap[s.session.id] === "NO"}
                    onChange={() =>
                      saveAttendance(s.session.id, "NO")
                    }
                  />
                  Nicht dabei
                </label>

                <label>
                  <input
                    type="radio"
                    checked={statusMap[s.session.id] === "MAYBE"}
                    onChange={() =>
                      saveAttendance(s.session.id, "MAYBE")
                    }
                  />
                  Vielleicht
                </label>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
