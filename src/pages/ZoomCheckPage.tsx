import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./zoomcheckpage.css";

interface UnmatchedParticipant {
    id: number;
    displayName: string;
    email: string | null;
    durationMin: number | null;
}

export default function ZoomCheckPage() {
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState("");
    const [participants, setParticipants] = useState<UnmatchedParticipant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            // navigate("/login");
        }
    }, [navigate]);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionId) {
            setError("Please enter a Session ID.");
            return;
        }

        setLoading(true);
        setError(null);
        setSearched(false);
        setParticipants([]);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/attendance/sessions/${sessionId}/zoom-unmatched`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setParticipants(data);
                setSearched(true);
            } else {
                const errData = await res.json();
                setError(errData.error || "Failed to fetch data.");
            }
        } catch (err) {
            setError("An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <div className="nav-left">
                    <span className="logo">SMP 2026</span>
                </div>
                <button onClick={() => navigate("/ohomepage")} className="logout-btn" style={{border: 'none', cursor: 'pointer'}}>
                    Back
                </button>
            </header>

            <main className="container">
                <h1>Check Unmatched Zoom Participants</h1>
                <div className="check-card">
                    <p>Enter the Session ID to view participants from the Zoom CSV who could not be matched to a registered user.</p>
                    <form onSubmit={handleCheck} className="check-form">
                        <div className="form-group">
                            <label htmlFor="sessionId">Session ID</label>
                            <div className="input-row">
                                <input 
                                    type="number" 
                                    id="sessionId" 
                                    value={sessionId} 
                                    onChange={(e) => setSessionId(e.target.value)}
                                    placeholder="Enter Session ID"
                                    required
                                />
                                <button type="submit" className="check-btn" disabled={loading}>
                                    {loading ? "Checking..." : "Check"}
                                </button>
                            </div>
                        </div>
                    </form>

                    {error && <div className="status-message error">{error}</div>}

                    {searched && participants.length === 0 && !error && (
                        <div className="status-message success">
                            No unmatched participants found for this session.
                        </div>
                    )}

                    {participants.length > 0 && (
                        <div className="results-table-wrapper">
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th>Display Name</th>
                                        <th>Email</th>
                                        <th>Duration (min)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map((p) => (
                                        <tr key={p.id}>
                                            <td>{p.displayName}</td>
                                            <td>{p.email || "-"}</td>
                                            <td>{p.durationMin || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}