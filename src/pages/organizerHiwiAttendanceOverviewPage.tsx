import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveEvent } from "../api/event";
import { hiwiAttendanceApi, type OrganizerSessionHiwiAttendance } from "../api/hiwiAttendance";
import "./organizerHiwiAttendanceOverview.css";

function formatDateTimeDe(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
}

function statusLabel(status: any) {
  if (status === "AVAILABLE") return "Dabei";
  if (status === "MAYBE") return "Vielleicht";
  if (status === "UNAVAILABLE") return "Nicht dabei";
  return "—";
}

export default function OrganizerHiwiAttendanceOverviewPage() {
  const navigate = useNavigate();

  const [eventTitle, setEventTitle] = useState("");
  const [rows, setRows] = useState<OrganizerSessionHiwiAttendance[]>([]);
  const [openSessionId, setOpenSessionId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    let available = 0, maybe = 0, unavailable = 0, unset = 0;
    for (const r of rows) {
      for (const h of r.hiwis) {
        if (h.status === "AVAILABLE") available++;
        else if (h.status === "MAYBE") maybe++;
        else if (h.status === "UNAVAILABLE") unavailable++;
        else unset++;
      }
    }
    return { available, maybe, unavailable, unset };
  }, [rows]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = { Authorization: `Bearer ${token}` };
        const ev = await getActiveEvent(headers);
        setEventTitle(ev.title ?? "");

        const data = await hiwiAttendanceApi.organizerByEvent(ev.id);
        data.sort((a, b) => new Date(a.session.startsAt).getTime() - new Date(b.session.startsAt).getTime());

        setRows(data);
        setOpenSessionId(data[0]?.session.id ?? null);
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  return (
    <div className="org-hiwiatt-page">
      <header className="navbar">
        <span className="logo">SMP 2026</span>
        <div className="nav-right">
          <Link to="/ohomepage" className="back-btn">← Dashboard</Link>
          <Link to="/login" className="logout-btn">Logout</Link>
        </div>
      </header>

      <main className="org-hiwiatt-container">
        <h1>HiWi-Verfügbarkeit</h1>
        <p className="org-hiwiatt-subtitle">
          Aktives Event: <strong>{loading ? "…" : (eventTitle || "—")}</strong>
        </p>

        {!loading && !error && (
          <div className="org-hiwiatt-summary">
            <div><strong>Dabei:</strong> {totals.available}</div>
            <div><strong>Vielleicht:</strong> {totals.maybe}</div>
            <div><strong>Nicht dabei:</strong> {totals.unavailable}</div>
            <div><strong>Unbekannt:</strong> {totals.unset}</div>
          </div>
        )}

        {loading && <div className="org-hiwiatt-info">Lade…</div>}
        {error && <div className="org-hiwiatt-error">{error}</div>}

        {!loading && !error && rows.length === 0 && (
          <div className="org-hiwiatt-empty">Keine Daten gefunden.</div>
        )}

        {!loading && !error && rows.map((r) => {
          const s = r.session;
          const open = openSessionId === s.id;

          return (
            <div key={s.id} className="org-hiwiatt-session">
              <button
                className="org-hiwiatt-session-head"
                onClick={() => setOpenSessionId(open ? null : s.id)}
              >
                <div className="org-hiwiatt-session-title">{s.title}</div>
                <div className="org-hiwiatt-session-meta">
                  {formatDateTimeDe(s.startsAt)} · {s.location || "—"} · HiWis: {r.hiwis.length}
                </div>
              </button>

              {open && (
                <div className="org-hiwiatt-session-body">
                  {r.hiwis.length === 0 ? (
                    <div className="org-hiwiatt-empty2">Keine HiWis zugeordnet.</div>
                  ) : (
                    <table className="org-hiwiatt-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>E-Mail</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.hiwis.map((h) => (
                          <tr key={h.userId}>
                            <td>{h.name}</td>
                            <td>{h.email}</td>
                            <td>{statusLabel(h.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}