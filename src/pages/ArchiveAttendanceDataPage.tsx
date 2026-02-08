import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./attendance.css";

type Session = {
    id: number;
    title: string;
    startsAt: string;
};

type AttendanceRow = {
    registrationId: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
    status: string;
};

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

function formatDateTimeDe(iso: string) {
    return new Date(iso).toLocaleString("de-DE", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function ArchiveAttendanceDataPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const eventId = params.get("eventId");

    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [rows, setRows] = useState<AttendanceRow[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [loadingRows, setLoadingRows] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        if (!eventId) {
            setError("Event-ID fehlt.");
            setLoadingSessions(false);
            return;
        }

        loadSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    async function loadSessions() {
        try {
            setLoadingSessions(true);
            setError(null);

            const res = await fetch(`/api/events/${eventId}/sessions`, {
                headers: getAuthHeaders(),
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || "Sessions konnten nicht geladen werden");
            }

            const data = await res.json();
            setSessions(data);
        } catch (e: any) {
            setError(e?.message ?? "Fehler beim Laden der Sessions");
        } finally {
            setLoadingSessions(false);
        }
    }

    async function loadAttendance(sessionId: number) {
        try {
            setLoadingRows(true);
            setError(null);
            setSelectedSessionId(sessionId);

            const res = await fetch(
                `/api/events/${eventId}/sessions/${sessionId}/attendance`,
                { headers: getAuthHeaders() }
            );

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || "Attendance-Daten konnten nicht geladen werden");
            }

            const data = await res.json();
            setRows(data);
        } catch (e: any) {
            setError(e?.message ?? "Fehler beim Laden der Anwesenheitsdaten");
        } finally {
            setLoadingRows(false);
        }
    }

    const selectedSession = useMemo(
        () => sessions.find((s) => s.id === selectedSessionId),
        [sessions, selectedSessionId]
    );

    return (
        <div className="attendance-page">
            {/* HEADER */}
            <header className="attendance-header">
                <div>
                    <h1>Anwesenheitsdaten (Archiv)</h1>
                    <p className="attendance-subtitle">
                        Read-only Ansicht für vergangene Events
                    </p>
                </div>

                <Link to="/archive" className="attendance-back">
                    ← Archiv
                </Link>
            </header>

            {error && <div className="attendance-error">{error}</div>}

            {/* SESSIONS */}
            <div className="attendance-sessions">
                <h2>Sessions</h2>

                {loadingSessions && <p>Lade Sessions…</p>}

                {!loadingSessions && sessions.length === 0 && (
                    <p>Keine Sessions gefunden.</p>
                )}

                <ul className="attendance-session-list">
                    {sessions.map((s) => (
                        <li key={s.id}>
                            <button
                                className={
                                    selectedSessionId === s.id
                                        ? "session-btn active"
                                        : "session-btn"
                                }
                                onClick={() => loadAttendance(s.id)}
                            >
                                <strong>{s.title}</strong>
                                <span>{formatDateTimeDe(s.startsAt)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* TABLE */}
            {selectedSession && (
                <div className="attendance-table-wrapper">
                    <h2>
                        Teilnehmer – <span>{selectedSession.title}</span>
                    </h2>

                    {loadingRows && <p>Lade Anwesenheitsdaten…</p>}

                    {!loadingRows && rows.length === 0 && (
                        <p>Keine Anwesenheitsdaten vorhanden.</p>
                    )}

                    {!loadingRows && rows.length > 0 && (
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Registrierung-ID</th>
                                    <th>Name</th>
                                    <th>E-Mail</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.registrationId}>
                                        <td>{r.registrationId}</td>
                                        <td>
                                            {[r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}
                                        </td>
                                        <td>{r.email}</td>
                                        <td>{r.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}