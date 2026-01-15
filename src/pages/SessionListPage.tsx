import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./sessionlist.css";

interface Session {
    id: number;
    title: string;
    description?: string | null;
    location?: string | null;
    startsAt: string;
    endsAt?: string | null;
}

export default function SessionListPage(){
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            // Assuming eventId 1 for this context
            const res = await fetch("/api/events/1/sessions", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            } else {
                setError("Failed to load sessions.");
            }
        } catch (err) {
            console.error(err);
            setError("Error loading sessions.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this session?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/events/1/sessions/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setSessions(prev => prev.filter(s => s.id !== id));
            } else {
                alert("Failed to delete session");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting session");
        }
    };

    return(
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>
                <div className="nav-right">
                    <Link to="/ohomepage" className="back-btn">
                        ← Dashboard
                    </Link>
                    
                    <Link to="/login" className="logout-btn">
                        Logout
                    </Link>
                </div>
            </header>

            <main className="container">
                <h1>Session Management</h1>

                <div className="top-actions">
                    <button className="create-btn" onClick={() => alert("Create functionality not implemented in this view")}>+ Create Session</button>
                </div>

                {loading && <p>Loading...</p>}
                {error && <p className="error-msg">{error}</p>}

                <div className="cards">
                    {sessions.map(session => (
                        <div key={session.id} className="card">
                            <h2>{session.title}</h2>
                            <p><strong>Start:</strong> {new Date(session.startsAt).toLocaleString()}</p>
                            {session.location && <p><strong>Location:</strong> {session.location}</p>}
                            <button 
                                onClick={() => handleDelete(session.id)}
                                style={{
                                    marginTop: "10px", backgroundColor: "#dc3545", color: "white", 
                                    border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer"
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                    {!loading && sessions.length === 0 && <p>No sessions found.</p>}
                </div>
            </main>
        </div>
    );

}