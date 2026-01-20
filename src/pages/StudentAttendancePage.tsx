import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./StudentAttendancePage.css";

type Session = {
  id: number;
  title: string;
  startsAt: string; // ISO string
  endsAt: string;   // ISO string
  location: string;
};

type Attendance = {
  id: number;
  sessionId?: number; // eğer include ile gelmiyorsa
  scannedAt: string;
  session?: {
    id: number;
  };
};

type Row = {
  session: Session;
  statusTextDe: string;
};

function formatDateTimeDe(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function computeStatusDe(sessionStartsAt: string, attended: boolean) {
  if (attended) return "Teilgenommen";
  const now = new Date();
  const start = new Date(sessionStartsAt);

  if (!isNaN(start.getTime()) && start.getTime() > now.getTime()) {
    return "Anwesenheit noch nicht erfasst";
  }
  return "Nicht teilgenommen";
}

export default function StudentAttendancePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sizde event list participant'a kapalı, ama StudentSessionsCalendar zaten eventId=1 ile gidiyor.
  // İstersen bunu env veya config'e taşırsın.
  const EVENT_ID_FOR_STUDENT_VIEW = 1;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Nicht eingeloggt. Bitte erneut anmelden.");
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1) all sessions (for event 1)
        const sessionsRes = await fetch(
          `/api/events/${EVENT_ID_FOR_STUDENT_VIEW}/sessions`,
          { headers }
        );

        if (!sessionsRes.ok) {
          const text = await sessionsRes.text();
          throw new Error(`Failed to fetch sessions (${sessionsRes.status}): ${text}`);
        }

        const sessionsJson = await sessionsRes.json();
        setSessions(Array.isArray(sessionsJson) ? sessionsJson : []);

        // 2) my attendance
        const attRes = await fetch(`/api/attendance/me`, { headers });

        if (!attRes.ok) {
          const text = await attRes.text();
          throw new Error(`Failed to fetch attendance (${attRes.status}): ${text}`);
        }

        const attJson = await attRes.json();
        setAttendances(Array.isArray(attJson) ? attJson : []);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const attendedSessionIds = useMemo(() => {
    const set = new Set<number>();
    for (const a of attendances) {
      // senin backend include ile session.id döndürüyor → en sağlamı bu
      const sid = a.session?.id ?? a.sessionId;
      if (typeof sid === "number") set.add(sid);
    }
    return set;
  }, [attendances]);

  const rows: Row[] = useMemo(() => {
    return sessions
      .slice()
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map((s) => {
        const attended = attendedSessionIds.has(s.id);
        return {
          session: s,
          statusTextDe: computeStatusDe(s.startsAt, attended),
        };
      });
  }, [sessions, attendedSessionIds]);

  return (
    <div>
      <div className="student-attendance-page">
        <div className="header-row">
          <div>
            <h1 className="title">Meine Anwesenheit</h1>
            <p className="subtitle">Übersicht über alle Sessions</p>
          </div>

          <Link className="back-link" to="/studenthomepage">
            ← Zurück
          </Link>
        </div>

        {loading && <div className="info-box">Lade Daten...</div>}

        {!loading && error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Datum</th>
                  <th>Ort</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.session.id}>
                    <td>{r.session.title}</td>
                    <td>{formatDateTimeDe(r.session.startsAt)}</td>
                    <td>{r.session.location}</td>
                    <td>{r.statusTextDe}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 16 }}>
                      Keine Sessions gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
