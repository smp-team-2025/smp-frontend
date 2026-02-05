import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./DiplomaListPage.css";

type ActiveEventDto = {
  id: number;
  title: string;
  isActive: boolean;
};

type Session = {
  id: number;
  title: string;
};

type Diploma = {
  id: number;
  createdAt: string;
  userId: number;
  fileName: string;
};

export default function DiplomaListPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeEvent, setActiveEvent] = useState<ActiveEventDto | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | "">("");

  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function init() {
    try {
      setLoading(true);
      setError("");

      // active event
      const evRes = await fetch("/api/events/active", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!evRes.ok) {
        const txt = await evRes.text().catch(() => "");
        throw new Error(`Aktives Event konnte nicht geladen werden (${evRes.status}) ${txt}`);
      }
      const ev = (await evRes.json()) as ActiveEventDto;
      setActiveEvent(ev);

      // sessions of active event
      const sRes = await fetch(`/api/events/${ev.id}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!sRes.ok) {
        const txt = await sRes.text().catch(() => "");
        throw new Error(`Sessions konnten nicht geladen werden (${sRes.status}) ${txt}`);
      }
      const sData = (await sRes.json()) as Session[];
      setSessions(sData);

      if (sData.length > 0) setSelectedSessionId(sData[0].id);

      // diplomas (by active event)
      const dRes = await fetch(`/api/diplomas?eventId=${ev.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!dRes.ok) {
        const txt = await dRes.text().catch(() => "");
        throw new Error(`Diplome konnten nicht geladen werden (${dRes.status}) ${txt}`);
      }
      const dData = (await dRes.json()) as Diploma[];
      setDiplomas(dData);
    } catch (e: any) {
      setError(e?.message || "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }

  async function refreshDiplomas() {
    if (!activeEvent?.id) return;
    try {
      setError("");
      const res = await fetch(`/api/diplomas?eventId=${activeEvent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Diplome konnten nicht geladen werden (${res.status}) ${txt}`);
      }
      setDiplomas((await res.json()) as Diploma[]);
    } catch (e: any) {
      setError(e?.message || "Fehler beim Laden");
    }
  }

  const activeTitle = useMemo(() => activeEvent?.title ?? "—", [activeEvent?.title]);

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

      <main className="diploma-container">
        <h1>Diplomas</h1>

        <div style={{ marginBottom: 12, color: "#666" }}>
          Aktives Event: <b>{activeTitle}</b>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="muted">Loading…</div>}

        {!loading && (
          <>
            <div className="controls">
              <label className="label">Session</label>
              <select
                className="select"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">(optional)</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>

              <button className="secondary-btn" onClick={refreshDiplomas} disabled={!activeEvent?.id}>
                Aktualisieren
              </button>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Datei</th>
                    <th>Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {diplomas.map((d) => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>{d.fileName}</td>
                      <td>{new Date(d.createdAt).toLocaleString("de-DE")}</td>
                    </tr>
                  ))}

                  {diplomas.length === 0 && (
                    <tr>
                      <td colSpan={3} className="muted">
                        Keine Diplome gefunden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}