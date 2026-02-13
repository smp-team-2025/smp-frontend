import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getActiveEvent } from "../api/event";
import "./OrganizerParticipantsPage.css";

type Participant = {
  registrationId: number;
  userId: number | null;
  email: string;

  firstName: string | null;
  lastName: string | null;

  school: string | null;
  grade: string | null;
  city: string | null;

  zipCode: string | null;
  street: string | null;
  addressExtra: string | null;

  createdAt: string; // ISO
  status: string;
};

function buildDisplayName(p: Participant) {
  const fn = (p.firstName ?? "").trim();
  const ln = (p.lastName ?? "").trim();
  const full = `${fn} ${ln}`.trim();
  return full || "—";
}

function formatDateTimeDe(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAddress(p: Participant) {
  const parts: string[] = [];
  if (p.street) parts.push(p.street);
  if (p.addressExtra) parts.push(p.addressExtra);

  const cityLine = [p.zipCode, p.city].filter(Boolean).join(" ");
  if (cityLine) parts.push(cityLine);

  return parts.length ? parts.join(", ") : "—";
}

export default function OrganizerParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);

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

        // active event id
        const ev = await getActiveEvent(headers);

        setActiveEventId(ev.id);

        // only participants for active event
        const res = await fetch(`/api/students?eventId=${ev.id}`, { headers });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch participants (${res.status}): ${text}`);
        }

        const json = await res.json();
        setParticipants(Array.isArray(json) ? (json as Participant[]) : []);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;

    return participants.filter((p) => {
      const haystack = [
        buildDisplayName(p),
        p.email,
        p.school ?? "",
        p.grade ?? "",
        p.city ?? "",
        p.street ?? "",
        p.zipCode ?? "",
        p.status ?? "",
        String(p.registrationId),
        p.userId != null ? String(p.userId) : "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [participants, query]);

  async function downloadParticipantsCsv(eventId: number) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Nicht eingeloggt.");

  setDownloading(true);
  try {
    const res = await fetch(`/api/students/export.csv?eventId=${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`CSV download failed (${res.status}): ${t}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `participants_event-${eventId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } finally {
    setDownloading(false);
  }
}

  return (
    <div className="org-participants-page">
      <div className="org-header">
        <div>
          <h1 className="org-title">Teilnehmer</h1>
          <p className="org-subtitle">Bestätigte Teilnehmende</p>
        </div>

        <Link className="org-back" to="/ohomepage">
          ← Zurück
        </Link>
      </div>

            <div className="org-toolbar" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input
          className="org-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen (Name / E-Mail / Schule / Ort / ID / Status …)"
        />
      
        <button
        onClick={() => activeEventId && downloadParticipantsCsv(activeEventId)}
        disabled={!activeEventId || downloading}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.12)",
          background: "rgba(0,0,0,0.04)",
          color: "#111",
          cursor: !activeEventId || downloading ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
          fontWeight: 600,
        }}
      >
        {downloading ? "CSV wird geladen…" : "CSV herunterladen"}
      </button>
      </div>

      {loading && <div className="org-info">Lade Daten…</div>}
      {!loading && error && <div className="org-error">{error}</div>}

      {!loading && !error && (
        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>Registrierung-ID</th>
                <th>User-ID</th>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Schule</th>
                <th>Jahrgang</th>
                <th>Ort</th>
                <th>Adresse</th>
                <th>Registriert am</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.registrationId}>
                  <td>{p.registrationId}</td>
                  <td>{p.userId ?? "—"}</td>
                  <td>{buildDisplayName(p)}</td>
                  <td>{p.email}</td>
                  <td>{p.school ?? "—"}</td>
                  <td>{p.grade ?? "—"}</td>
                  <td>{p.city ?? "—"}</td>
                  <td>{formatAddress(p)}</td>
                  <td>{formatDateTimeDe(p.createdAt)}</td>
                  <td>{p.status ?? "—"}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: 16 }}>
                    Keine passenden Teilnehmenden gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}