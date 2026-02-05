import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { hiwiApi} from "../api/hiwi";
import type { HiwiSession } from "../api/hiwi";
import { getActiveEvent } from "../api/event";
import "./attendance.css";

export default function HiwiStatisticsPage() {
    const navigate = useNavigate();

    const [sessions, setSessions] = useState<HiwiSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        (async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                const active = await getActiveEvent(headers);

                const mySessions = await hiwiApi.getMySessions();
                const filtered = mySessions.filter((s) => s.session?.event?.id === active.id);
                setSessions(filtered);


            } catch (e: any) {
                setError(e?.message || "Failed to load data.");
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP</span>
                <div className="nav-right">
                    <Link to="/hiwihomepage" className="back-btn">
                        ← Dashboard
                    </Link>
                    <Link to="/login" className="logout-btn">
                        Logout
                    </Link>
                </div>
            </header>

            <main className="container">
                <h1>HiWi Statistics</h1>

                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

                {!loading && !error && sessions.length === 0 && <p>No sessions found for the active event.</p>}

                {!loading && !error && sessions.length > 0 && (
                    <div className="cards">
                        {sessions.map((s) => (
                            <div key={s.id} className="card">
                                <h2>{s.session.title}</h2>
                                <p>{new Date(s.session.startsAt).toLocaleString("de-DE")}</p>
                                <p style={{ color: "#666" }}>{s.session.location}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}