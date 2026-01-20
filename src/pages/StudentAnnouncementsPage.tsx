import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./StudentAnnouncementsPage.css";

type Announcement = {
  id: number;
  title: string | null;
  body: string;
  createdAt: string;
  visibility: "ORGA_ONLY" | "HIWI_ORGA" | "PUBLIC";
  eventId: number | null;
  sessionId: number | null;
  author?: {
    id: number;
    name: string;
    role: string;
  };
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

function nl2br(text: string) {
  return text.split("\n").map((line, idx) => (
    <span key={idx}>
      {line}
      <br />
    </span>
  ));
}

export default function StudentAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const EVENT_ID_FOR_STUDENT_VIEW = 1;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Nicht eingeloggt. Bitte erneut anmelden.");
      setLoading(false);
      return;
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/announcements?eventId=${EVENT_ID_FOR_STUDENT_VIEW}`,
          { headers }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch announcements (${res.status}): ${text}`);
        }

        const json = await res.json();
        setItems(Array.isArray(json) ? json : []);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="student-announcements-page">
      <div className="header-row">
        <div>
          <h1 className="title">Ankündigungen</h1>
          <p className="subtitle">Öffentliche Ankündigungen</p>
        </div>

        <Link className="back-link" to="/studenthomepage">
          ← Zurück
        </Link>
      </div>

      {loading && <div className="info-box">Lade Daten...</div>}

      {!loading && error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="list">
          {items.length === 0 ? (
            <div className="empty-box">Keine Ankündigungen gefunden.</div>
          ) : (
            items.map((a) => (
              <div className="announcement-card" key={a.id}>
                <div className="announcement-head">
                  <div className="announcement-title">
                    {a.title?.trim() ? a.title : "Ohne Titel"}
                  </div>
                  <div className="announcement-meta">
                    <span>{formatDateTimeDe(a.createdAt)}</span>
                    {a.author?.name ? <span>• {a.author.name}</span> : null}
                  </div>
                </div>

                <div className="announcement-body">{nl2br(a.body)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}