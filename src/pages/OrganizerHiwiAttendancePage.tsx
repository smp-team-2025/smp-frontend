import { useEffect, useState } from "react";
import { getActiveEvent } from "../api/event";
import "./hiwiAttendance.css";

type SessionRow = {
  sessionId: number;
  sessionTitle: string;
  status: "YES" | "NO" | "MAYBE" | null;
};

export default function HiwiAttendancePage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const event = await getActiveEvent(headers);

    const res = await fetch(
      `/api/events/${event.id}/my-hiwi-attendance`,
      { headers }
    );

    const data = await res.json();
    setSessions(data);
    setLoading(false);
  }

  async function updateStatus(
    sessionId: number,
    status: "YES" | "NO" | "MAYBE"
  ) {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    await fetch(
      `/api/sessions/${sessionId}/hiwi-attendance`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      }
    );

    setSessions(prev =>
      prev.map(s =>
        s.sessionId === sessionId ? { ...s, status } : s
      )
    );
  }

  if (loading) return <p className="loading">Lade Verfügbarkeit…</p>;

  return (
    <div className="container">
      <h1>Meine Verfügbarkeit</h1>

      {sessions.length === 0 && (
        <p>Keine Sessions für das aktive Event gefunden.</p>
      )}

      <table>
        <thead>
          <tr>
            <th>Session</th>
            <th>Mein Status</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.sessionId}>
              <td>{s.sessionTitle}</td>
              <td>
                <select
                  value={s.status ?? ""}
                  onChange={e =>
                    updateStatus(
                      s.sessionId,
                      e.target.value as "YES" | "NO" | "MAYBE"
                    )
                  }
                >
                  <option value="" disabled>
                    Bitte wählen
                  </option>
                  <option value="YES">Da</option>
                  <option value="NO">Nicht da</option>
                  <option value="MAYBE">Vielleicht</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
