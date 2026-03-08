import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingPdfKey, setDownloadingPdfKey] = useState<string | null>(null);
  const navigate = useNavigate();
  const [openingSettings, setOpeningSettings] = useState(false);

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

    const goToDiplomaSettings = () => {
    setOpeningSettings(true);
    navigate("/ohomepage/diplomas/settings");
  };

  async function downloadDiplomaListCsv() {
  if (!activeEvent) return;

  setDownloadingCsv(true);
  setError(null);

  try {
    const blob = await diplomasApi.downloadIssuedCsvByEvent(activeEvent.id);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `diplomas_event-${activeEvent.id}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (e: any) {
    setError(e?.message || "CSV konnte nicht heruntergeladen werden");
  } finally {
    setDownloadingCsv(false);
  }
}

async function downloadDiplomaPdf(participantId: number, eventId: number, fileName?: string) {
   const key = `${participantId}:${eventId}`;
   setDownloadingPdfKey(key);
   setError(null);
         
   try {
     const token = localStorage.getItem("token");
     if (!token) throw new Error("Nicht eingeloggt.");
   
     const res = await fetch(`/api/diplomas/${participantId}/${eventId}`, {
       method: "GET",
       headers: { Authorization: `Bearer ${token}` },
     });
   
     if (!res.ok) {
       const text = await res.text().catch(() => "");
       throw new Error(text || `Download fehlgeschlagen (${res.status})`);
     }
   
     const blob = await res.blob();
     const url = window.URL.createObjectURL(blob);
   
     const a = document.createElement("a");
     a.href = url;
     a.download = fileName ? `${fileName}.pdf` : `diploma_${participantId}_${eventId}.pdf`;
     document.body.appendChild(a);
     a.click();
     a.remove();
   
     window.URL.revokeObjectURL(url);
   } catch (e: any) {
     setError(e?.message || "PDF konnte nicht heruntergeladen werden");
   } finally {
     setDownloadingPdfKey(null);
   }
 }

const actionButtonStyle: React.CSSProperties = {
  minWidth: 170,
  height: 55,
  padding: "0 18px",
  borderRadius: 8,
  border: "none",
  background: "#111",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

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
            style={actionButtonStyle}
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


          <button
            style={actionButtonStyle}
            onClick={() => navigate("/ohomepage/diplomas/settings")}
            disabled={!activeEvent}
          >
            Diplom-Einstellungen
          </button>
          <button
            style={actionButtonStyle}
            onClick={downloadDiplomaListCsv}
            disabled={!activeEvent || downloadingCsv}
          >
            {downloadingCsv ? "CSV wird erstellt..." : "CSV herunterladen"}
          </button>
        </div>

        {loading ? (
          <p style={{ marginTop: 20 }}>Lädt...</p>
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
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "#4c6fff",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={() => downloadDiplomaPdf(d.participant.id, d.event.id, "SMP-Diplom")}
                      disabled={downloadingPdfKey === `${d.participant.id}:${d.event.id}`}
                    >
                      {downloadingPdfKey === `${d.participant.id}:${d.event.id}` ? "Wird heruntergeladen..." : "Download"}
                    </button>
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