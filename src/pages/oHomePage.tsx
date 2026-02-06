import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ohomepage.css";
import { getActiveEvent } from "../api/event";
import { checkAuthAndRedirect } from "../utils/auth";
import { getMe } from "../api/auth";

export default function OHomePage() {
    const navigate = useNavigate();
    type Session = {
        id: number;
        title: string;
        startsAt: string;
        endsAt?: string | null;
        location?: string | null;
    };

    const [upcoming, setUpcoming] = useState<Session | null>(null);
    const [upcomingLoading, setUpcomingLoading] = useState(true);
    const [upcomingError, setUpcomingError] = useState<string | null>(null);
    const [name, setName] = useState<string>("");


    useEffect(() => {
        // Token check
        const ok = checkAuthAndRedirect(navigate);
        if (!ok) return;

        // Role check
        const role = localStorage.getItem("role");
        if (role !== "ORGANIZER") {
            navigate("/login", { replace: true });
            return;
        }
    }, [navigate]);

    useEffect(() => {
        (async () => {
            try {
                setUpcomingLoading(true);
                setUpcomingError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    setUpcomingError("Nicht eingeloggt.");
                    return;
                }

                const headers: HeadersInit = { Authorization: `Bearer ${token}` };

                const ev = await getActiveEvent(headers); // { id, title, ... }
                const res = await fetch(`/api/events/${ev.id}/sessions`, { headers });

                if (!res.ok) throw new Error("Sessions konnten nicht geladen werden.");

                const sessions: Session[] = await res.json();

                const now = Date.now();
                const next = sessions
                    .slice()
                    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
                    .find((s) => new Date(s.startsAt).getTime() > now) ?? null;

                setUpcoming(next);
            } catch (e: any) {
                setUpcomingError(e?.message ?? "Fehler beim Laden der nächsten Session.");
                setUpcoming(null);
            } finally {
                setUpcomingLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        const ok = checkAuthAndRedirect(navigate);
        if (!ok) return;

        const headers = {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        getMe(headers)
            .then((me) => setName(me.name))
            .catch(() => setName(""));
    }, []);



    return (
        <div className="page-wrapper">
            <header className="navbar">
                <div className="nav-left">
                    <span className="logo">SMP 2026</span>
                </div>

                <Link to="/login" className="logout-btn">
                    Logout
                </Link>
            </header>

            <main className="container">
                <h1>Organizer Dashboard</h1>

                <p className="greeting">
                    Hallo, {name}!
                </p>

                <div className="upcoming-card">
                    <div className="upcoming-title">Upcoming session</div>

                    {upcomingLoading ? (
                        <div className="upcoming-muted">Lädt…</div>
                    ) : upcomingError ? (
                        <div className="upcoming-error">{upcomingError}</div>
                    ) : !upcoming ? (
                        <div className="upcoming-muted">Keine kommende Session gefunden.</div>
                    ) : (
                        <div className="upcoming-content">
                            <div className="upcoming-name">{upcoming.title}</div>
                            <div className="upcoming-meta">
                                <span>
                                    🕒{" "}
                                    {new Date(upcoming.startsAt).toLocaleString("de-DE", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </span>
                                <span>
                                    📍 {upcoming.location || "TBA"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="cards">
                    <Link to="/ohomepage/eventlist" className="card">
                        <h2>Event Verwaltung</h2>
                        <p>Event erstellen und verwalten</p>
                    </Link>

                    <Link to="/ohomepage/sessionlist" className="card">
                        <h2>Session Verwaltung</h2>
                        <p>Event Sessions erstellen und verwalten</p>
                    </Link>


                    <Link to="/ohomepage/hiwilist" className="card">
                        <h2>HiWi Verwaltung</h2>
                        <p>Hiwi's erstellen und verwalten</p>
                    </Link>


                    <Link to="/questions" className="card">
                        <h2>Fermi Fragen</h2>
                        <p>Verwaltung von Fermi Fragenbank</p>
                    </Link>

                    <Link to="/quiz/create" className="card">
                        <h2>Quiz Erstellen</h2>
                        <p>Erstelle neue Fermi Fragen</p>
                    </Link>

                    <Link to="/quiz/manage" className="card">
                        <h2>Quiz Verwaltung</h2>
                        <p>Vorhandene Quizes bearbeiten oder löschen</p>
                    </Link>

                    <Link to="/quizlist" className="card">
                        <h2>Quiz-Ergebnisse</h2>
                        <p>Statistiken anzeigen</p>
                    </Link>

                    <Link to="/ohomepage/attendance" className="card">
                        <h2>Anwesenheitsdaten</h2>
                        <p>Anwesenheitsprotokolle anzeigen</p>
                    </Link>

                    <Link to="/ohomepage/announcements" className="card">
                        <h2>Ankündigungen</h2>
                        <p>Ankündigungen erstellen und auflisten</p>
                    </Link>

                    <Link to="/ohomepage/zoom" className="card">
                        <h2>Zoom Upload csv</h2>
                        <p>Upload and get attendance</p>
                    </Link>

                    <Link to="/ohomepage/diplomas" className="card">
                        <h2>Diplomas</h2>
                        <p>Erstellte Diplome auflisten und herunterladen</p>
                    </Link>

                    <Link to="/admin/registrations" className="card">
                        <h2>Registrierungen genehmigen</h2>
                        <p>Benutzerregistrierungen genehmigen oder ablehnen</p>
                    </Link>

                    <Link to="/organizer/participants" className="card">
                        <h2>Teilnehmer</h2>
                        <p>Bestätigte Teilnehmende anzeigen</p>
                    </Link>

                    <Link to="/registration-deadline" className="card">
                        <h2>Registrierungsfrist</h2>
                        <p>Registrierungsfrist festlegen (Register-Button ausblenden)</p>
                    </Link>


                </div>
            </main>
        </div>
    );
}