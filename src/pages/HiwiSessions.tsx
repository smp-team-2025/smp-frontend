import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hiwiApi, type HiwiSession } from "../api/hiwi";
import "./hiwisessions.css";

export default function HiwiSessions() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<HiwiSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const data = await hiwiApi.getMySessions();
            setSessions(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load sessions.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("de-DE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (start: string, end: string) => {
        const startTime = new Date(start).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
        const endTime = new Date(end).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
        return `${startTime} - ${endTime}`;
    };

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <div className="nav-left">
                    <span className="logo">SMP 2026</span>
                </div>
                <button onClick={() => navigate("/hiwihomepage")} className="logout-btn" style={{ border: 'none', cursor: 'pointer' }}>
                    Back
                </button>
            </header>

            <main className="container">
                <h1>My Assigned Sessions</h1>

                {loading && <p>Loading sessions...</p>}
                {error && <p className="error-msg">{error}</p>}

                {!loading && !error && sessions.length === 0 && (
                    <p>You have no assigned sessions yet.</p>
                )}

                <div className="sessions-list">
                    {sessions.map((item) => (
                        <div key={item.id} className="session-card">
                            <div className="session-header">
                                <span className="session-date">{formatDate(item.session.startsAt)}</span>
                                <span className="session-time">{formatTime(item.session.startsAt, item.session.endsAt)}</span>
                            </div>
                            <h2 className="session-title">
                                {item.session.event.title}: {item.session.title}
                            </h2>
                            <div className="session-location">
                                📍 {item.session.location || "No location specified"}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}