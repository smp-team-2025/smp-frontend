import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

export default function ArchiveParticipantsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();


    const eventIdStr = searchParams.get("eventId") ?? "";
    const eventIdNum = Number(eventIdStr);

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        if (!eventIdStr || Number.isNaN(eventIdNum)) {
            setError("Fehlender oder ungültiger eventId Parameter.");
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

                const res = await fetch(`/api/students?eventId=${encodeURIComponent(eventIdStr)}`, {
                    headers,
                });

                if (!res.ok) {
                    const text = await res.text().catch(() => "");
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
    }, [navigate, eventIdStr, eventIdNum]);

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

    return (
        <div className="org-participants-page">
            <div className="org-header">
                <div>
                    <h1 className="org-title">Teilnehmer</h1>
                    <p className="org-subtitle">Bestätigte Teilnehmende (Archiv)</p>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <Link className="org-back" to="/archive">
                        ← Archiv
                    </Link>
                </div>
            </div>

            <div className="org-toolbar">
                <input
                    className="org-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Suchen (Name / E-Mail / Schule / Ort / ID / Status …)"
                />
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