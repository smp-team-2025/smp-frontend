import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type EventItem = {
    id: number;
    title: string;
    isActive?: boolean;
    startsAt?: string | null;
    endsAt?: string | null;
};

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
}

function formatDateTimeDe(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
}

export default function ArchiveEventsPage() {
    const navigate = useNavigate();

    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [expandedEventId, setExpandedEventId] = useState<number | null>(null);

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

                const res = await fetch("/api/events", { headers: getAuthHeaders() });
                if (!res.ok) {
                    const text = await res.text().catch(() => "");
                    throw new Error(`Failed to load events (${res.status}): ${text}`);
                }

                const data = await res.json();
                setEvents(Array.isArray(data) ? (data as EventItem[]) : []);
            } catch (e: any) {
                setError(e?.message ?? "Fehler beim Laden");
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    const archivedEvents = useMemo(() => {
        return events
            .filter((e) => e.isActive === false)
            .sort((a, b) => {
                const ta = a.startsAt ? new Date(a.startsAt).getTime() : 0;
                const tb = b.startsAt ? new Date(b.startsAt).getTime() : 0;
                return tb - ta;
            });
    }, [events]);

    const toggleExpand = (eventId: number) => {
        setExpandedEventId((prev) => (prev === eventId ? null : eventId));
    };

    const ActionButton = ({
        to,
        label,
    }: {
        to: string;
        label: string;
    }) => (
        <Link
            to={to}
            style={{
                textDecoration: "none",
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "white",
                fontSize: 13,
                fontWeight: 700,
                color: "#333",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
            }}
        >
            {label}
        </Link>
    );

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

            <main className="container" style={{ maxWidth: 1000 }}>
                <h1>Archive</h1>
                <p style={{ color: "#666", marginTop: 8 }}>
                    Hier sehen Sie alle nicht-aktiven Events. Klicken Sie ein Event an, um Archiv-Daten zu öffnen.
                </p>

                {loading && <p style={{ marginTop: 18 }}>Lade…</p>}
                {error && <p style={{ marginTop: 18, color: "#b00020" }}>{error}</p>}

                {!loading && !error && archivedEvents.length === 0 && (
                    <div
                        style={{
                            marginTop: 18,
                            padding: 16,
                            background: "white",
                            borderRadius: 14,
                            boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                            color: "#555",
                        }}
                    >
                        Keine archivierten Events gefunden.
                    </div>
                )}

                {!loading && !error && archivedEvents.length > 0 && (
                    <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                        {archivedEvents.map((ev) => {
                            const open = expandedEventId === ev.id;

                            return (
                                <div
                                    key={ev.id}
                                    style={{
                                        background: "white",
                                        borderRadius: 16,
                                        padding: 18,
                                        boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                                        border: "1px solid rgba(0,0,0,0.06)",
                                    }}
                                >
                                    {/* clickable header */}
                                    <div
                                        onClick={() => toggleExpand(ev.id)}
                                        style={{
                                            cursor: "pointer",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 18, fontWeight: 900 }}>
                                                {ev.title || `Event #${ev.id}`}
                                            </div>
                                            <div style={{ marginTop: 8, color: "#555", fontSize: 14 }}>
                                                <div>
                                                    <strong>Start:</strong> {formatDateTimeDe(ev.startsAt)}
                                                </div>
                                                <div>
                                                    <strong>Ende:</strong> {formatDateTimeDe(ev.endsAt)}
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                fontWeight: 900,
                                                color: "#0b63b6",
                                                userSelect: "none",
                                                paddingTop: 2,
                                            }}
                                        >
                                            {open ? "▲" : "▼"}
                                        </div>
                                    </div>

                                    {/* action buttons */}
                                    {open && (
                                        <div
                                            style={{
                                                marginTop: 14,
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 10,
                                            }}
                                        >
                                            <ActionButton
                                                label="Anwesenheitsdaten"
                                                to={`/archive/attendance?eventId=${ev.id}`}
                                            />
                                            <ActionButton
                                                label="Ankündigungen"
                                                to={`/archive/announcements?eventId=${ev.id}`}
                                            />
                                            <ActionButton
                                                label="Diplomas"
                                                to={`/archive/diplomas?eventId=${ev.id}`}
                                            />
                                            <ActionButton
                                                label="Teilnehmer"
                                                to={`/archive/participants?eventId=${ev.id}`}
                                            />
                                            <ActionButton
                                                label="Quiz-Ergebnisse"
                                                to={`/archive/quiz?eventId=${ev.id}`}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}