import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { hiwiAttendanceApi, type AvailabilityStatus, type HiwiMySession } from "../api/hiwiAttendance";
import "./hiwiAvailability.css";

function formatDateTimeDe(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
}

function labelForStatus(s: AvailabilityStatus) {
  if (s === "AVAILABLE") return "Dabei";
  if (s === "MAYBE") return "Vielleicht";
  return "Nicht dabei";
}

export default function HiwiAvailabilityPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<HiwiMySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groupedByEventTitle = useMemo(() => {
    const map = new Map<string, HiwiMySession[]>();
    for (const r of rows) {
      const key = r.session.event?.title || "Sessions";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    // sessions sort
    for (const [k, list] of map) {
      list.sort((a, b) => new Date(a.session.startsAt).getTime() - new Date(b.session.startsAt).getTime());
      map.set(k, list);
    }
    return Array.from(map.entries());
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
        const data = await hiwiAttendanceApi.mySessions();
        setRows(data);
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  async function setStatus(hiwiSessionId: number, status: AvailabilityStatus) {
    try {
      setSavingId(hiwiSessionId);
      setError(null);

      await hiwiAttendanceApi.setStatus(hiwiSessionId, status);

      setRows((prev) => prev.map((r) => (r.id === hiwiSessionId ? { ...r, status } : r)));
    } catch (e: any) {
      setError(e?.message ?? "Speichern fehlgeschlagen");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="hiwi-av-page">
      <header className="navbar">
        <span className="logo">SMP 2026</span>
        <div className="nav-right">
          <Link to="/hiwihomepage" className="back-btn">← Dashboard</Link>
        </div>
      </header>

      <main className="hiwi-av-container">
        <h1>Meine Verfügbarkeit</h1>
        <p className="hiwi-av-subtitle">
          Bitte gib an, ob du bei den folgenden Sessions verfügbar bist.
        </p>

        {loading && <div className="hiwi-av-info">Lade…</div>}
        {error && <div className="hiwi-av-error">{error}</div>}

        {!loading && !error && rows.length === 0 && (
          <div className="hiwi-av-empty">Du bist aktuell keiner Session zugeordnet.</div>
        )}

        {!loading && !error && groupedByEventTitle.map(([eventTitle, list]) => (
          <section key={eventTitle} className="hiwi-av-section">
            <h2 className="hiwi-av-h2">{eventTitle}</h2>

            <div className="hiwi-av-grid">
              {list.map((r) => {
                const s = r.session;
                const disabled = savingId === r.id;

                return (
                  <div key={r.id} className="hiwi-av-card">
                    <div className="hiwi-av-card-head">
                      <div className="hiwi-av-title">{s.title}</div>
                      <div className="hiwi-av-meta">
                        <div><strong>Wann:</strong> {formatDateTimeDe(s.startsAt)}</div>
                        <div><strong>Wo:</strong> {s.location || "—"}</div>
                      </div>
                    </div>

                    <div className="hiwi-av-choices">
                      {(["AVAILABLE", "MAYBE", "UNAVAILABLE"] as AvailabilityStatus[]).map((st) => (
                        <label key={st} className={`hiwi-av-pill ${r.status === st ? "active" : ""}`}>
                          <input
                            type="radio"
                            name={`avail-${r.id}`}
                            checked={r.status === st}
                            onChange={() => setStatus(r.id, st)}
                            disabled={disabled}
                          />
                          <span>{labelForStatus(st)}</span>
                        </label>
                      ))}
                    </div>

                    {disabled && <div className="hiwi-av-hint">Speichern…</div>}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}