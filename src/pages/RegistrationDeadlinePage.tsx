import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveEvent } from "../api/event";
import { updateRegistrationDeadline } from "../api/event";

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
    };
}

// YYYY-MM-DD (input[type=date]) -> ISO end-of-day (local)
function dateToLocalEndOfDayIso(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59, 999);
    return dt.toISOString();
}

// ISO -> YYYY-MM-DD
function isoToDateInput(iso: string): string {
    const dt = new Date(iso);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function RegistrationDeadlinePage() {
    const navigate = useNavigate();

    const [eventId, setEventId] = useState<number | null>(null);
    const [eventTitle, setEventTitle] = useState<string>("");
    const [currentDeadlineIso, setCurrentDeadlineIso] = useState<string | null>(null);

    // date input state
    const [pickedDate, setPickedDate] = useState<string>(""); // YYYY-MM-DD

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const currentDisplay = useMemo(() => {
        if (!currentDeadlineIso) return "—";
        const d = new Date(currentDeadlineIso);
        return d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
    }, [currentDeadlineIso]);

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

                const headers = getAuthHeaders();
                const ev = await getActiveEvent(headers);
                setEventId(ev.id);
                setEventTitle(ev.title ?? "");

                const iso = ev.registrationClosesAt ?? null;

                setCurrentDeadlineIso(iso);
                setPickedDate(iso ? isoToDateInput(iso) : "");
            } catch (e: any) {
                setError(e?.message ?? "Fehler beim Laden");
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    async function handleSave() {
        if (!eventId) return;

        const nextIso = pickedDate ? dateToLocalEndOfDayIso(pickedDate) : null;

        try {
            setSaving(true);
            setError(null);
            setInfo(null);

            const headers = getAuthHeaders();
            await updateRegistrationDeadline(eventId, headers, nextIso);

            setCurrentDeadlineIso(nextIso);
            setInfo("Gespeichert.");
        } catch (e: any) {
            setError(e?.message ?? "Speichern fehlgeschlagen");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>
                <div className="nav-right">
                    <Link to="/ohomepage" className="back-btn">← Dashboard</Link>
                    <Link to="/login" className="logout-btn">Logout</Link>
                </div>
            </header>

            <main className="container" style={{ maxWidth: 900 }}>
                <h1>Registrierungsfrist</h1>
                <p style={{ color: "#555", marginTop: 8 }}>
                    Aktives Event: <strong>{loading ? "…" : (eventTitle || "—")}</strong>
                </p>

                {loading && <p style={{ marginTop: 20 }}>Lade…</p>}
                {error && <div style={{ marginTop: 20, color: "#b00020" }}>{error}</div>}
                {info && <div style={{ marginTop: 20, color: "#1b5e20" }}>{info}</div>}

                {!loading && !error && (
                    <div style={{
                        marginTop: 24,
                        background: "white",
                        borderRadius: 16,
                        padding: 20,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.08)"
                    }}>
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ color: "#666", fontSize: 13 }}>Aktuell ausgewählt</div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>{currentDisplay}</div>
                        </div>

                        <div style={{
                            background: "#fff7e6",
                            border: "1px solid #ffe0a3",
                            borderRadius: 12,
                            padding: 14,
                            color: "#6b4a00",
                            marginBottom: 16
                        }}>
                            Hier wird festgelegt, dass nach dem von Ihnen gewählten Datum der Register-Button
                            auf der Startseite nicht mehr angezeigt wird, die Registrierungs-URL jedoch weiterhin funktioniert.
                        </div>

                        <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>
                            Datum (optional)
                        </label>

                        <input
                            type="date"
                            value={pickedDate}
                            onChange={(e) => setPickedDate(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1px solid #ccc",
                                marginBottom: 12
                            }}
                        />


                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                padding: "10px 16px",
                                borderRadius: 10,
                                border: "none",
                                background: saving ? "#ccc" : "#0b63b6",
                                color: "white",
                                fontWeight: 700,
                                cursor: saving ? "not-allowed" : "pointer"
                            }}
                        >
                            {saving ? "Speichert…" : "Speichern"}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}