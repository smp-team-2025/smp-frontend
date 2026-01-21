import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { hiwiApi, type HiwiSession } from "../api/hiwi";
import "./attendance.css";

interface SessionSummary {
    sessionId: number;
    title: string;
    startsAt: string;
    attendanceCount: number;
}

export default function HiWiStatisticsPage() {
    const navigate = useNavigate();
    const [assignedSessions, setAssignedSessions] = useState<HiwiSession[]>([]);
    const [summaries, setSummaries] = useState<SessionSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            // 1. Get assigned sessions
            const mySessions = await hiwiApi.getMySessions();
            setAssignedSessions(mySessions);

            // 2. Get summaries (attendance counts)
            const res = await fetch("/api/events/1/sessions/summary", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setSummaries(data);
            } else {
                console.error("Failed to load summaries");
            }

        } catch (err) {
            console.error(err);
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    // Group assigned sessions by date
    const groupedSessions = assignedSessions.reduce((acc, item) => {
        const date = new Date(item.session.startsAt).toLocaleDateString("de-DE", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {} as Record<string, HiwiSession[]>);

    const sortedGroups = Object.entries(groupedSessions).sort(([, sessionsA], [, sessionsB]) => {
        return new Date(sessionsA[0].session.startsAt).getTime() - new Date(sessionsB[0].session.startsAt).getTime();
    });

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>
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
                <h1>Attendance Statistics</h1>

                {loading && <p>Loading...</p>}
                {error && <p className="error-msg">{error}</p>}
                
                {!loading && sortedGroups.length === 0 && <p>No assigned sessions found.</p>}

                <div className="cards">
                    {sortedGroups.map(([date, sessions]) => (
                        <div key={date} className="card" style={{ cursor: "default", height: "auto" }}>
                            <h2>{date}</h2>
                            <div className="session-stats-list">
                                {sessions.map(item => {
                                    const summary = summaries.find(s => s.sessionId === item.session.id);
                                    const count = summary ? summary.attendanceCount : 0;
                                    return (
                                        <div key={item.id} className="stat-row" style={{ marginTop: '15px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '10px' }}>
                                            <h3 style={{ fontSize: '1.1rem', margin: '0 0 5px 0' }}>{item.session.title}</h3>
                                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>
                                                {new Date(item.session.startsAt).toLocaleTimeString("de-DE", {hour: '2-digit', minute:'2-digit'})} - 
                                                {new Date(item.session.endsAt).toLocaleTimeString("de-DE", {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                            <div style={{ fontSize: '1rem' }}>
                                                Attendance: <strong>{count}</strong>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
