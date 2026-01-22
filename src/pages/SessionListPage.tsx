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

interface Hiwi {
    id: number;
    clothingSize: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface AssignedHiwi {
    assignmentId: number;
    sessionId: number;
    hiwiId: number;
    assignedAt: string;
    hiwi: Hiwi;
}

interface AvailableHiwi {
    id: number;
    clothingSize: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    };
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
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [assignedHiwis, setAssignedHiwis] = useState<AssignedHiwi[]>([]);
    const [availableHiwis, setAvailableHiwis] = useState<AvailableHiwi[]>([]);
    const [loadingHiwis, setLoadingHiwis] = useState(false);
    const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);

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

        if (!newSession.startsAt) {
            alert("Start time is required");
            return;
        }

        const res = await fetch("/api/events/1/sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                title: newSession.title,
                description: newSession.description || null,
                location: newSession.location || null,
                startsAt: new Date(newSession.startsAt).toISOString(),
                endsAt: newSession.endsAt ? new Date(newSession.endsAt).toISOString() : null,
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
            const data = await res.json().catch(() => ({}));
            if (data.error === "EVENT_NOT_FOUND") {
                alert("Event ID 1 not found in database. Please create the event first.");
            } else {
                alert(data.error || "Failed to create session");
            }
        }
    };

    const fetchHiwisForSession = async (sessionId: number) => {
        setLoadingHiwis(true);
        const token = localStorage.getItem("token");

        try {
            const [assignedRes, availableRes] = await Promise.all([
                fetch(`/api/events/1/sessions/${sessionId}/hiwis`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch("/api/hiwi", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (assignedRes.ok) {
                const assigned = await assignedRes.json();
                setAssignedHiwis(assigned);
            }

            if (availableRes.ok) {
                const available = await availableRes.json();
                setAvailableHiwis(available);
            }
        } catch (err) {
            console.error("Failed to fetch HiWis:", err);
        } finally {
            setLoadingHiwis(false);
        }
    };

    const handleManageHiwis = (sessionId: number) => {
        if (selectedSessionId === sessionId) {
            setSelectedSessionId(null);
            setAssignedHiwis([]);
            setAvailableHiwis([]);
        } else {
            setSelectedSessionId(sessionId);
            fetchHiwisForSession(sessionId);
        }
    };

    const handleSessionClick = (sessionId: number) => {
        if (expandedSessionId === sessionId) {
            setExpandedSessionId(null);
            setAssignedHiwis([]);
        } else {
            setExpandedSessionId(sessionId);
            fetchAssignedHiwisOnly(sessionId);
        }
    };

    const fetchAssignedHiwisOnly = async (sessionId: number) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/events/1/sessions/${sessionId}/hiwis`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const assigned = await res.json();
                setAssignedHiwis(assigned);
            }
        } catch (err) {
            console.error("Failed to fetch HiWis:", err);
        }
    };

    const handleAssignHiwi = async (sessionId: number, hiwiId: number) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/events/1/sessions/${sessionId}/hiwis`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ hiwiId }),
        });

        if (res.ok) {
            fetchHiwisForSession(sessionId);
        } else {
            const data = await res.json().catch(() => ({}));
            alert(data.error || "Failed to assign HiWi");
        }
    };

    const handleUnassignHiwi = async (sessionId: number, hiwiId: number) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/events/1/sessions/${sessionId}/hiwis/${hiwiId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            fetchHiwisForSession(sessionId);
        } else {
            const data = await res.json().catch(() => ({}));
            alert(data.error || "Failed to unassign HiWi");
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
                            <div onClick={() => handleSessionClick(session.id)} style={{ cursor: 'pointer' }}>
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

                            {expandedSessionId === session.id && (
                                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                                    <h4 style={{ marginBottom: '10px' }}>Assigned HiWis</h4>
                                    {assignedHiwis.length === 0 ? (
                                        <p style={{ fontSize: '0.9rem', color: '#666' }}>No HiWis assigned yet</p>
                                    ) : (
                                        <ul style={{ paddingLeft: '20px', margin: '0' }}>
                                            {assignedHiwis.map((assigned) => (
                                                <li key={assigned.hiwiId} style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                                                    {assigned.hiwi.user.name} ({assigned.hiwi.user.email})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <button
                                className="session-manage-hiwis-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleManageHiwis(session.id);
                                }}
                                style={{
                                    marginTop: '10px',
                                    padding: '8px 12px',
                                    backgroundColor: selectedSessionId === session.id ? '#dc3545' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {selectedSessionId === session.id ? 'Close HiWi Management' : 'Manage HiWis'}
                            </button>

                            {selectedSessionId === session.id && (
                                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                    {loadingHiwis ? (
                                        <p>Loading HiWis...</p>
                                    ) : (
                                        <>
                                            <div style={{ marginBottom: '15px' }}>
                                                <h4 style={{ marginBottom: '10px' }}>Assigned HiWis</h4>
                                                {assignedHiwis.length === 0 ? (
                                                    <p>No HiWis assigned yet.</p>
                                                ) : (
                                                    <div>
                                                        {assignedHiwis.map((assigned) => (
                                                            <div
                                                                key={assigned.hiwiId}
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    padding: '8px',
                                                                    marginBottom: '5px',
                                                                    backgroundColor: 'white',
                                                                    borderRadius: '4px'
                                                                }}
                                                            >
                                                                <span>{assigned.hiwi.user.name} ({assigned.hiwi.user.email})</span>
                                                                <button
                                                                    onClick={() => handleUnassignHiwi(session.id, assigned.hiwiId)}
                                                                    style={{
                                                                        padding: '4px 8px',
                                                                        backgroundColor: '#dc3545',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h4 style={{ marginBottom: '10px' }}>Available HiWis</h4>
                                                {availableHiwis.filter(h => !assignedHiwis.some(a => a.hiwiId === h.id)).length === 0 ? (
                                                    <p>All HiWis are assigned or no HiWis available.</p>
                                                ) : (
                                                    <div>
                                                        {availableHiwis
                                                            .filter(h => !assignedHiwis.some(a => a.hiwiId === h.id))
                                                            .map((hiwi) => (
                                                                <div
                                                                    key={hiwi.id}
                                                                    style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        padding: '8px',
                                                                        marginBottom: '5px',
                                                                        backgroundColor: 'white',
                                                                        borderRadius: '4px'
                                                                    }}
                                                                >
                                                                    <span>{hiwi.user.name} ({hiwi.user.email})</span>
                                                                    <button
                                                                        onClick={() => handleAssignHiwi(session.id, hiwi.id)}
                                                                        style={{
                                                                            padding: '4px 8px',
                                                                            backgroundColor: '#28a745',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        Assign
                                                                    </button>
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
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
