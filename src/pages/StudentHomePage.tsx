import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./student_homepage.css";
import { getActiveEvent } from "../api/event";
import { checkAuthAndRedirect } from "../utils/auth";
import { getMe } from "../api/auth";

export default function StudentHomePage() {
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
        if (role !== "PARTICIPANT") {
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

                <div className="nav-right">
                    <Link to="/login" className="logout-btn"> Logout </Link>
                </div>
            </header>

            <main className="container">
                <h1>Dashboard</h1>
                <p className="greeting">
                    Hallo, {name}! <span className="wave">👋</span>
                </p>

                <div className="upcoming-card">
                    <div className="upcoming-title">Kommende Session</div>

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

                    <Link to="/studenthomepage/calendar" className="card">
                        <h2>Mein Kalender</h2>
                        <p>Anstehende Sessions anzeigen</p>
                    </Link>

                    <Link to="/student/quiz-sessions" className="card">
                        <h2>Fermi Quiz</h2>
                        <p>Wählen Sie eine Quiz-Session aus.</p>
                    </Link>

                    <Link to="/studenthomepage/qr" className="card">
                        <h2>QR Code Check-in</h2>
                        <p>Anwesenheit per QR-Scan</p>
                    </Link>

                    <Link to="/studenthomepage/businesscard" className="card-link">
                        <div className="card">
                            <h2>Visitenkarte</h2>
                            <p>QR-Karten für Teilnehmer ausdrucken</p>
                        </div>
                    </Link>


                    <Link to="/studenthomepage/attendance" className="card">
                        <h2>Meine Anwesenheit</h2>
                        <p>Zeige deine Anwesenheit für alle Sessions an</p>
                    </Link>

                    <Link to="/studentannouncements" className="card">
                        <h2>Ankündigungen</h2>
                        <p>Öffentliche Ankündigungen ansehen</p>
                    </Link>

                    <Link to="/student/account" className="card">
                        <h2>Konto bearbeiten</h2>
                        <p>Name und Adresse ändern</p>
                    </Link>





                </div>
            </main>

        </div>
    );

}