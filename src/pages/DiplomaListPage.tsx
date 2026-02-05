import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { diplomasApi, type DiplomaIssued } from "../api/diplomas";
import { getActiveEvent } from "../api/event";
import "./admin.css";

type Session = {
  id: number;
  title: string;
  startsAt: string;
};

export default function DiplomaListPage() {
  const [activeEvent, setActiveEvent] = useState<{ id: number; title: string } | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<string>(""); // optional filter
  const [items, setItems] = useState<DiplomaIssued[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Nicht eingeloggt.");
      setLoading(false);
      return;
    }

    const headers: HeadersInit = { Authorization: `Bearer ${token}` };


    (async () => {
      try {
        setLoading(true);
        setError(null);

        const ev = await getActiveEvent(headers);
        setActiveEvent(ev);

        // sessions for dropdown
        const sRes = await fetch(`/api/events/${ev.id}/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          setSessions(Array.isArray(sData) ? sData : []);
        }

        // diplomas for active event
        const list = await diplomasApi.listIssuedByEvent(ev.id);
        setItems(list);
      } catch (e: any) {
        setError(e?.message || "Diplome konnten nicht geladen werden");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!sessionId) return items;
    return items;
  }, [items, sessionId]);

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
        <h1>Diplomas</h1>

        {activeEvent && (
          <p>
            Aktives Event: <strong>{activeEvent.title}</strong>
          </p>
        )}

        {error && (
          <div style={{ background: "#ffe5e5", padding: 12, borderRadius: 8, color: "#b00020" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14 }}>
          <label style={{ fontWeight: 600 }}>Session</label>
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            style={{ minWidth: 360 }}
          >
            <option value="">(optional)</option>
            {sessions.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.title}
              </option>
            ))}
          </select>

          <button
            onClick={async () => {
              if (!activeEvent) return;
              setLoading(true);
              setError(null);
              try {
                const list = await diplomasApi.listIssuedByEvent(activeEvent.id);
                setItems(list);
              } catch (e: any) {
                setError(e?.message || "Diplome konnten nicht geladen werden");
              } finally {
                setLoading(false);
              }
            }}
          >
            Aktualisieren
          </button>
        </div>

        {loading ? (
          <p style={{ marginTop: 20 }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ marginTop: 20 }}>Keine Diplome gefunden.</p>
        ) : (
          <table className="admin-table" style={{ marginTop: 20 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Datei</th>
                <th>Erstellt</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.certificateNumber}</td>
                  <td>{new Date(d.createdAt).toLocaleString("de-DE")}</td>
                  <td>
                    <Link to={`/diplomas/${d.participant.id}/${d.event.id}`}>
                      Download
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}