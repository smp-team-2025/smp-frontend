import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./hiwihome.css";
import { getActiveEvent } from "../api/event";
import { checkAuthAndRedirect } from "../utils/auth";
import { getMe } from "../api/auth";

export default function HiwiHomePage() {
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
        if (role !== "HIWI") {
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
                <span className="logo">SMP 2026</span>
                <div className="nav-right">
                    <Link to="/login" className="logout-btn"> Logout </Link>
                </div>
            </header>

            <main className="container">

                <h1>Dashboard</h1>
                <p className="greeting">Hallo, {name}! 👋</p>

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

                    {/* MY SESSIONS */}
                    <Link to="/hiwihomepage/sessions" className="card">
                        <h2>My Sessions</h2>
                        <p>View assigned sessions</p>
                    </Link>

                    {/* QR CODE */}
                    <Link to="/hiwihomepage/scan" className="card">
                        <h2>QR Code Check-in</h2>
                        <p>Scan participant QR codes</p>
                    </Link>

                    {/* ATTENDANCE */}
                    <Link to="/hiwihomepage/statistics" className="card">
                        <h2>Attendance</h2>
                        <p>View attendance logs</p>
                    </Link>

                    <Link to="/hiwiannouncements" className="card">
                        <h2>Announcements</h2>
                        <p>View announcements</p>
                    </Link>



                </div>

            </main>
        </div>
    );

}