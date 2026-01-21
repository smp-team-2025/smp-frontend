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

export default function SessionListPage() {
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

            const res = await fetch("/api/events/1/sessions", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data: Session[] = await res.json();
                setSessions(
                    data.sort(
                        (a, b) =>
                            new Date(a.startsAt).getTime() -
                            new Date(b.startsAt).getTime()
                    )
                );
            } else {
                setError("Failed to load sessions.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load sessions.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setNewSession((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const res = await fetch("/api/events/1/sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...newSession,
                description: newSession.description || null,
                location: newSession.location || null,
                endsAt: newSession.endsAt || null,
            }),
        });

        if (res.ok) {
            const created = await res.json();
            setSessions((prev) =>
                [...prev, created].sort(
                    (a, b) =>
                        new Date(a.startsAt).getTime() -
                        new Date(b.startsAt).getTime()
                )
            );
            setShowCreateForm(false);
            setNewSession({
                title: "",
                description: "",
                location: "",
                startsAt: "",
                endsAt: "",
            });
        } else {
            alert("Failed to create session");
        }
    };

    return (
        <div className="session-page">
            <header className="session-navbar">
                <span className="session-logo">SMP 2026</span>
                <div className="session-nav-actions">
                    <Link to="/ohomepage" className="session-back">
                        ← Dashboard
                    </Link>
                    <Link to="/login" className="session-logout">
                        Logout
                    </Link>
                </div>
            </header>

            <main className="session-container">
                <h1>Session Management</h1>

                <button
                    className="session-create-btn"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? "− Cancel" : "+ Create Session"}
                </button>

                {showCreateForm && (
                    <div className="session-create-wrapper">
                        <div className="session-create-card">
                            <h2>Create New Session</h2>
                            <form
                                onSubmit={handleCreateSession}
                                className="session-form"
                            >
                                <input
                                    name="title"
                                    placeholder="Title"
                                    value={newSession.title}
                                    onChange={handleChange}
                                    required
                                />
                                <textarea
                                    name="description"
                                    placeholder="Description (optional)"
                                    value={newSession.description}
                                    onChange={handleChange}
                                />
                                <input
                                    name="location"
                                    placeholder="Location (optional)"
                                    value={newSession.location}
                                    onChange={handleChange}
                                />

                                <div className="session-form-row">
                                    <div>
                                        <label>Start Time</label>
                                        <input
                                            type="datetime-local"
                                            name="startsAt"
                                            value={newSession.startsAt}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label>End Time</label>
                                        <input
                                            type="datetime-local"
                                            name="endsAt"
                                            value={newSession.endsAt}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="session-save-btn"
                                >
                                    Save Session
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {loading && <p>Loading...</p>}
                {error && <p className="session-error">{error}</p>}

                <div className="session-grid">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="session-card"
                        >
                            <h3>{session.title}</h3>
                            <p>
                                <strong>Start:</strong>{" "}
                                {new Date(
                                    session.startsAt
                                ).toLocaleString()}
                            </p>
                            {session.location && (
                                <p>
                                    <strong>Location:</strong>{" "}
                                    {session.location}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {!loading && sessions.length === 0 && (
                    <p>No sessions found.</p>
                )}
            </main>
        </div>
    );
}
