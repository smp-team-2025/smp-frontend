import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./OrganizerParticipantsPage.css";

type Participant = {
  id: number;
  name?: string | null;
  email?: string | null;

  // sizde bunlar farklı isimde olabilir:
  role?: string;
  createdAt?: string;

  // registration bilgileri sizde include ediliyorsa:
  registration?: {
    firstName?: string | null;
    lastName?: string | null;
    salutation?: string | null;
    city?: string | null;
    school?: string | null;
    grade?: string | null;
  } | null;
};

function buildDisplayName(p: Participant) {
  const reg = p.registration;
  const fn = reg?.firstName?.trim();
  const ln = reg?.lastName?.trim();

  if (fn || ln) return `${fn ?? ""} ${ln ?? ""}`.trim();
  if (p.name?.trim()) return p.name.trim();
  return `User #${p.id}`;
}

export default function OrganizerParticipantsPage() {
  const navigate = useNavigate();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const res = await fetch("/api/students", { headers });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch participants (${res.status}): ${text}`);
        }

        const json = await res.json();
        setParticipants(Array.isArray(json) ? json : []);
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
      const name = buildDisplayName(p).toLowerCase();
      const email = (p.email ?? "").toLowerCase();
      const school = (p.registration?.school ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || school.includes(q);
    });
  }, [participants, query]);

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

      <div className="org-toolbar">
        <input
          className="org-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nach Name / E-Mail / Schule suchen…"
        />
      </div>

      {loading && <div className="org-info">Lade Daten…</div>}

      {!loading && error && <div className="org-error">{error}</div>}

      {!loading && !error && (
        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Schule</th>
                <th>Jahrgang</th>
                <th>Ort</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{buildDisplayName(p)}</td>
                  <td>{p.email ?? "—"}</td>
                  <td>{p.registration?.school ?? "—"}</td>
                  <td>{p.registration?.grade ?? "—"}</td>
                  <td>{p.registration?.city ?? "—"}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
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