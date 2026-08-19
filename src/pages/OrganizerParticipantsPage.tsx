import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getActiveEvent } from "../api/event";
import { deleteParticipant, updateParticipant, type ParticipantUpdate } from "../api/students";
import "./OrganizerParticipantsPage.css";
import "./student_homepage.css";

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

type EditDraft = {
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  grade: string;
  city: string;
  street: string;
  addressExtra: string;
  zipCode: string;
};

// Same values as the registration form
const GRADE_OPTIONS = [
  { value: "jünger", label: "Jünger als Klasse 10" },
  { value: "Klasse-10", label: "Klasse 10" },
  { value: "Klasse-11", label: "Klasse 11" },
  { value: "Klasse-12", label: "Klasse 12" },
  { value: "Klasse-13", label: "Klasse 13" },
  { value: "Klasse-10-G", label: "Klasse 10 G8" },
  { value: "Klasse-11-G", label: "Klasse 11 G8" },
  { value: "Klasse-12-G", label: "Klasse 12 G8" },
  { value: "teachers", label: "Lehrer" },
  { value: "others", label: "Andere" },
];

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_REGISTERED: "Diese E-Mail-Adresse wird bereits verwendet.",
  EMPTY_FIELD: "Bitte füllen Sie alle Pflichtfelder aus.",
  NO_FIELDS: "Es wurden keine Änderungen vorgenommen.",
  NOT_FOUND: "Teilnehmer wurde nicht gefunden. Bitte laden Sie die Seite neu.",
  PARTICIPANT_HAS_REFERENCES:
    "Teilnehmer kann nicht gelöscht werden, da noch verknüpfte Daten vorhanden sind.",
  INVALID_ID: "Ungültige Teilnehmer-ID.",
};

function toGermanError(e: unknown) {
  const raw = e instanceof Error ? e.message : String(e);
  return ERROR_MESSAGES[raw] ?? raw;
}

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

function formatGrade(grade: string | null) {
  if (!grade) return "—";
  return GRADE_OPTIONS.find((o) => o.value === grade)?.label ?? grade;
}

function toDraft(p: Participant): EditDraft {
  return {
    firstName: p.firstName ?? "",
    lastName: p.lastName ?? "",
    email: p.email ?? "",
    school: p.school ?? "",
    grade: p.grade ?? "",
    city: p.city ?? "",
    street: p.street ?? "",
    addressExtra: p.addressExtra ?? "",
    zipCode: p.zipCode ?? "",
  };
}

export default function OrganizerParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  function startEdit(p: Participant) {
    setActionError(null);
    setEditingId(p.registrationId);
    setDraft(toDraft(p));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setActionError(null);
  }

  function updateDraft(field: keyof EditDraft, value: string) {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function saveEdit(registrationId: number) {
    if (!draft) return;

    const payload: ParticipantUpdate = {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim(),
      school: draft.school.trim(),
      grade: draft.grade.trim(),
      city: draft.city.trim(),
      street: draft.street.trim(),
      addressExtra: draft.addressExtra.trim(),
      zipCode: draft.zipCode.trim(),
    };

    const required: (keyof ParticipantUpdate)[] = [
      "firstName",
      "lastName",
      "email",
      "school",
      "grade",
      "city",
      "street",
      "zipCode",
    ];

    if (required.some((field) => !String(payload[field] ?? "").trim())) {
      setActionError(ERROR_MESSAGES.EMPTY_FIELD);
      return;
    }

    try {
      setSaving(true);
      setActionError(null);

      await updateParticipant(registrationId, payload);

      setParticipants((prev) =>
        prev.map((p) =>
          p.registrationId === registrationId
            ? {
                ...p,
                firstName: payload.firstName ?? p.firstName,
                lastName: payload.lastName ?? p.lastName,
                email: payload.email ?? p.email,
                school: payload.school ?? p.school,
                grade: payload.grade ?? p.grade,
                city: payload.city ?? p.city,
                street: payload.street ?? p.street,
                addressExtra: payload.addressExtra || null,
                zipCode: payload.zipCode ?? p.zipCode,
              }
            : p
        )
      );

      cancelEdit();
    } catch (e) {
      setActionError(toGermanError(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Participant) {
    const ok = window.confirm(
      `Teilnehmer „${buildDisplayName(p)}“ wirklich löschen? Die Registrierung und der zugehörige Login werden dauerhaft entfernt.`
    );
    if (!ok) return;

    try {
      setDeletingId(p.registrationId);
      setActionError(null);

      await deleteParticipant(p.registrationId);

      setParticipants((prev) => prev.filter((x) => x.registrationId !== p.registrationId));
      if (editingId === p.registrationId) cancelEdit();
    } catch (e) {
      setActionError(toGermanError(e));
    } finally {
      setDeletingId(null);
    }
  }

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
    <div className="page-wrapper">
      <header className="navbar">
        <div className="nav-left">
          <span className="logo">SMP 2026</span>
        </div>
        <div className="nav-right">
          <Link to="/ohomepage" className="back-btn">
            ← Dashboard
          </Link>
          <Link to="/login" className="logout-btn">
            Logout
          </Link>
        </div>
      </header>

      <main className="container org-participants-main">
        <h1>Teilnehmer</h1>
        <p className="org-subtitle">Bestätigte Teilnehmende</p>

        <div className="org-toolbar">
          <input
            className="org-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen (Name / E-Mail / Schule / Ort / ID / Status …)"
          />

          <button
            className="org-btn"
            onClick={() => activeEventId && downloadParticipantsCsv(activeEventId)}
            disabled={!activeEventId || downloading}
          >
            {downloading ? "CSV wird geladen…" : "CSV herunterladen"}
          </button>
        </div>

      {loading && <div className="org-info">Lade Daten…</div>}
      {!loading && error && <div className="org-error">{error}</div>}
      {!loading && !error && actionError && (
        <div className="org-error" style={{ marginBottom: 16 }}>{actionError}</div>
      )}

      {!loading && !error && (
        <div className="org-table-wrap">
          <table className={editingId !== null ? "org-table is-editing" : "org-table"}>
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
                <th>Aktionen</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => {
                const isEditing = editingId === p.registrationId && draft !== null;

                return (
                <tr key={p.registrationId}>
                  <td>{p.registrationId}</td>
                  <td>{p.userId ?? "—"}</td>

                  <td>
                    {isEditing ? (
                      <div className="org-edit-stack">
                        <input
                          className="org-edit-input"
                          value={draft!.firstName}
                          onChange={(e) => updateDraft("firstName", e.target.value)}
                          placeholder="Vorname"
                          aria-label="Vorname"
                        />
                        <input
                          className="org-edit-input"
                          value={draft!.lastName}
                          onChange={(e) => updateDraft("lastName", e.target.value)}
                          placeholder="Nachname"
                          aria-label="Nachname"
                        />
                      </div>
                    ) : (
                      buildDisplayName(p)
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        className="org-edit-input"
                        type="email"
                        value={draft!.email}
                        onChange={(e) => updateDraft("email", e.target.value)}
                        placeholder="E-Mail"
                        aria-label="E-Mail"
                      />
                    ) : (
                      p.email
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        className="org-edit-input"
                        value={draft!.school}
                        onChange={(e) => updateDraft("school", e.target.value)}
                        placeholder="Schule"
                        aria-label="Schule"
                      />
                    ) : (
                      p.school ?? "—"
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        className="org-edit-input"
                        value={draft!.grade}
                        onChange={(e) => updateDraft("grade", e.target.value)}
                        aria-label="Jahrgang"
                      >
                        <option value="">Jahrgang auswählen</option>
                        {GRADE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      formatGrade(p.grade)
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        className="org-edit-input"
                        value={draft!.city}
                        onChange={(e) => updateDraft("city", e.target.value)}
                        placeholder="Ort"
                        aria-label="Ort"
                      />
                    ) : (
                      p.city ?? "—"
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <div className="org-edit-stack">
                        <input
                          className="org-edit-input"
                          value={draft!.street}
                          onChange={(e) => updateDraft("street", e.target.value)}
                          placeholder="Straße und Hausnummer"
                          aria-label="Straße und Hausnummer"
                        />
                        <input
                          className="org-edit-input"
                          value={draft!.addressExtra}
                          onChange={(e) => updateDraft("addressExtra", e.target.value)}
                          placeholder="Adresszusatz (optional)"
                          aria-label="Adresszusatz"
                        />
                        <input
                          className="org-edit-input"
                          value={draft!.zipCode}
                          onChange={(e) => updateDraft("zipCode", e.target.value)}
                          placeholder="PLZ"
                          aria-label="PLZ"
                        />
                      </div>
                    ) : (
                      formatAddress(p)
                    )}
                  </td>

                  <td>{formatDateTimeDe(p.createdAt)}</td>
                  <td>{p.status ?? "—"}</td>

                  <td>
                    <div className="org-row-actions">
                      {isEditing ? (
                        <>
                          <button
                            className="org-btn org-btn-primary"
                            onClick={() => saveEdit(p.registrationId)}
                            disabled={saving}
                          >
                            {saving ? "Speichern…" : "Speichern"}
                          </button>
                          <button className="org-btn" onClick={cancelEdit} disabled={saving}>
                            Abbrechen
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="org-btn" onClick={() => startEdit(p)}>
                            Bearbeiten
                          </button>
                          <button
                            className="org-btn org-btn-danger"
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p.registrationId}
                          >
                            {deletingId === p.registrationId ? "Löschen…" : "Löschen"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: 16 }}>
                    Keine passenden Teilnehmenden gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      </main>
    </div>
  );
}
