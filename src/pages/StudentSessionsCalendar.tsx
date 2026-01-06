import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentApi, type StudentSession } from "../api/student";
import "./studentsessionscalendar.css";

interface DateGroup {
    dateKey: string;
    displayDate: string;
    sessions: StudentSession[];
}

export default function StudentSessionsCalendar() {
    const navigate = useNavigate();
    const [groupedSessions, setGroupedSessions] = useState<DateGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const data = await studentApi.getMySessions();
            const groups = groupSessionsByDate(data);
            setGroupedSessions(groups);
        } catch (err) {
            console.error(err);
            setError("Failed to load sessions.");
        } finally {
            setLoading(false);
        }
    };

    const groupSessionsByDate = (sessions: StudentSession[]) => {
        const groups: { [key: string]: DateGroup } = {};
        
        sessions.forEach(session => {
            const dateObj = new Date(session.startsAt);
            const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD for sorting
            const displayDate = dateObj.toLocaleDateString("de-DE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            if (!groups[dateKey]) {
                groups[dateKey] = { dateKey, displayDate, sessions: [] };
            }
            groups[dateKey].sessions.push(session);
        });

        // Sort by date and return array
        return Object.values(groups).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
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
                <button onClick={() => navigate("/studenthomepage")} className="logout-btn" style={{ border: 'none', cursor: 'pointer' }}>
                    Back
                </button>
            </header>

            <main className="container">
                <h1>My Session Calendar</h1>

                {loading && <p>Loading calendar...</p>}
                {error && <p className="error-msg">{error}</p>}
                {!loading && !error && groupedSessions.length === 0 && <p>No upcoming sessions found.</p>}

                <div className="calendar-list">
                    {groupedSessions.map((group) => (
                        <div key={group.dateKey} className="date-group">
                            <h3 className="date-header">{group.displayDate}</h3>
                            <div className="sessions-grid">
                                {group.sessions.map(session => (
                                    <div key={session.id} className="calendar-card">
                                        <div className="time-badge">{formatTime(session.startsAt, session.endsAt)}</div>
                                        <h4 className="session-title">{session.title}</h4>
                                        <div className="session-meta">{session.event.title}</div>
                                        <div className="session-location">📍 {session.location}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}