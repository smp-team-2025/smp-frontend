import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { diplomasApi, type DiplomaIssued } from "../api/diplomas";
import "./admin.css";

export default function ArchiveDiplomaListPage() {
    const [searchParams] = useSearchParams();
    const eventId = Number(searchParams.get("eventId"));

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [diplomas, setDiplomas] = useState<DiplomaIssued[]>([]);

    useEffect(() => {
        if (!eventId || Number.isNaN(eventId)) {
            setError("Ungültige Event-ID");
            setLoading(false);
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await diplomasApi.listIssuedByEvent(eventId);
                setDiplomas(data);
            } catch (e: any) {
                setError(e?.message ?? "Fehler beim Laden der Diplome");
            } finally {
                setLoading(false);
            }
        })();
    }, [eventId]);

    const count = useMemo(() => diplomas.length, [diplomas]);

    async function handleDownload(participantId: number) {
        try {
            const blob = await diplomasApi.downloadPdf(participantId, eventId);
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `diploma-${participantId}-event-${eventId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (e: any) {
            alert(e?.message ?? "Download fehlgeschlagen");
        }
    }

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>
                <div className="nav-right">
                    <Link to="/archive" className="back-btn">← Archiv</Link>
                    <Link to="/login" className="logout-btn">Logout</Link>
                </div>
            </header>

            <main className="container">
                <h1>Diplomas (Archiv)</h1>
                <p className="subtitle">
                    Read-only Ansicht für archivierte Events
                </p>

                {loading && <p>Lade…</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

                {!loading && !error && (
                    <>
                        <p>
                            <strong>{count}</strong> ausgestellte Diplome
                        </p>

                        {count === 0 ? (
                            <p>Keine Diplome vorhanden.</p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Teilnehmer</th>
                                        <th>E-Mail</th>
                                        <th>Schule</th>
                                        <th>Zertifikatsnr.</th>
                                        <th>Ausgestellt am</th>
                                        <th>Download</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {diplomas.map((d) => (
                                        <tr key={d.id}>
                                            <td>{d.participant.name}</td>
                                            <td>{d.participant.email ?? "—"}</td>
                                            <td>{d.participant.registration?.school ?? "—"}</td>
                                            <td>{d.certificateNumber}</td>
                                            <td>
                                                {new Date(d.issuedAt).toLocaleDateString("de-DE")}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn"
                                                    onClick={() => handleDownload(d.participant.id)}
                                                >
                                                    PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}