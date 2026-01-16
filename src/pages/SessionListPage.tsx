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
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newSession, setNewSession] = useState({
        title: "",
        description: "",
        location: "",
        startsAt: "",
        endsAt: "",
    });

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
                const data: Session[] = await res.json();
                data.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
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

    function handleNewSessionChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setNewSession(prev => ({ ...prev, [name]: value }));
    }

    async function handleCreateSession(e: React.FormEvent) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!newSession.title || !newSession.startsAt) {
            alert("Title and Start Date are required.");
            return;
        }

        try {
            const res = await fetch("/api/events/1/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newSession,
                    description: newSession.description || null,
                    location: newSession.location || null,
                    endsAt: newSession.endsAt || null,
                })
            });

            if (res.status === 201) {
                const createdSession = await res.json();
                setSessions(prev => [...prev, createdSession].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
                setShowCreateForm(false);
                setNewSession({ title: "", description: "", location: "", startsAt: "", endsAt: "" });
            } else {
                const errorData = await res.json();
                alert(`Failed to create session: ${errorData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error creating session");
        }
    }

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
                    <button className="create-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
                        {showCreateForm ? "− Cancel" : "+ Create Session"}
                    </button>
                </div>

                {showCreateForm && (
                    <div className="card" style={{ marginBottom: '2rem', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Create New Session</h2>
                        <form onSubmit={handleCreateSession} className="session-form">
                            <input name="title" value={newSession.title} onChange={handleNewSessionChange} placeholder="Title" required />
                            <textarea name="description" value={newSession.description} onChange={handleNewSessionChange} placeholder="Description (optional)"></textarea>
                            <input name="location" value={newSession.location} onChange={handleNewSessionChange} placeholder="Location (optional)" />
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input name="startsAt" type="datetime-local" value={newSession.startsAt} onChange={handleNewSessionChange} required />
                                </div>
                                <div className="form-group">
                                    <label>End Time (optional)</label>
                                    <input name="endsAt" type="datetime-local" value={newSession.endsAt} onChange={handleNewSessionChange} />
                                </div>
                            </div>
                            <button type="submit" className="create-btn" style={{ alignSelf: 'flex-start' }}>Save Session</button>
                        </form>
                    </div>
                )}

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