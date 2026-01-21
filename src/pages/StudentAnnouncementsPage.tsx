import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./StudentAnnouncementsPage.css";

type Announcement = {
  id: number;
  title: string | null;
  body: string;
  createdAt: string;
  author?: {
    name: string;
  };
};

function formatDateTimeDe(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function StudentAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Nicht eingeloggt");
      setLoading(false);
      return;
    }

    fetch("/api/announcements?eventId=1", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setError("Fehler beim Laden"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      {/* NAVBAR */}
      <header className="navbar">
        <span className="logo">SMP 2026</span>
        <div className="nav-right">
          <Link to="/studenthomepage" className="back-btn">
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="container">
        <h1>Ankündigungen</h1>
        <p className="ann-subtitle">Öffentliche Ankündigungen</p>

        {loading && <div className="ann-info">Lade Daten...</div>}
        {error && <div className="ann-error">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="ann-empty">Keine Ankündigungen gefunden.</div>
        )}

        <div className="ann-list">
          {items.map((a) => (
            <div key={a.id} className="ann-card">
              <div className="ann-head">
                <h3>{a.title || "Ohne Titel"}</h3>
                <span>{formatDateTimeDe(a.createdAt)}</span>
              </div>

              <p className="ann-body">{a.body}</p>

              {a.author?.name && (
                <div className="ann-author">— {a.author.name}</div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
