import { useEffect, useState, type ReactNode } from "react";
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

/**
 * Parse [color=...]...[/color] tags and keep line breaks (\n -> <br/>)
 * Supported:
 *   [color=red]text[/color]
 *   [color=#ff00aa]text[/color]
 * Nested colors supported.
 */
function renderColoredText(input: string): ReactNode {
  if (!input) return null;

  const tokenRegex = /\[color=([^\]]+)\]|\[\/color\]/g;

  type StyleFrame = { color: string };
  const stack: StyleFrame[] = [];

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  function pushTextChunk(text: string) {
    if (!text) return;

    const parts = text.split("\n");
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part) {
        const color = stack.length ? stack[stack.length - 1].color : undefined;
        nodes.push(
          color ? (
            <span key={`t-${key++}`} style={{ color }}>
              {part}
            </span>
          ) : (
            <span key={`t-${key++}`}>{part}</span>
          )
        );
      }
      if (i < parts.length - 1) nodes.push(<br key={`br-${key++}`} />);
    }
  }

  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(input)) !== null) {
    pushTextChunk(input.slice(lastIndex, match.index));

    const full = match[0];
    if (full.startsWith("[color=")) {
      const rawColor = match[1]?.trim() || "";
      const ok =
        /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawColor) ||
        /^[a-zA-Z]+$/.test(rawColor);
      if (ok) stack.push({ color: rawColor });
    } else if (full === "[/color]") {
      if (stack.length) stack.pop();
    }

    lastIndex = tokenRegex.lastIndex;
  }

  pushTextChunk(input.slice(lastIndex));
  return nodes;
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
      .then((r) => {
        if (!r.ok) throw new Error("Request failed");
        return r.json();
      })
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

              {/*colored render + line breaks */}
              <div className="ann-body">{renderColoredText(a.body)}</div>

              {a.author?.name && <div className="ann-author">— {a.author.name}</div>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}