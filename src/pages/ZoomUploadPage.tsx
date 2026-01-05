import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./zoomuploadpage.css";

export default function ZoomUploadPage() {
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            // navigate("/login");
        }
    }, [navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionId || !file) {
            setStatus({ type: 'error', msg: "Please provide both Session ID and a CSV file." });
            return;
        }

        setLoading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append("sessionId", sessionId);
        formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/attendance/zoom/upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ 
                    type: 'success', 
                    msg: `Success! Matched: ${data.matchedCount}, Unmatched: ${data.unmatchedCount}` 
                });
            } else {
                setStatus({ type: 'error', msg: data.error || "Upload failed." });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: "An error occurred during upload." });
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
                <h1>Zoom Attendance Upload</h1>
                <div className="upload-card">
                    <p>Select the Zoom CSV file and enter the Session ID to process attendance.</p>
                    <form onSubmit={handleSubmit} className="upload-form">
                        <div className="form-group">
                            <label htmlFor="sessionId">Session ID</label>
                            <input 
                                type="number" 
                                id="sessionId" 
                                value={sessionId} 
                                onChange={(e) => setSessionId(e.target.value)}
                                placeholder="Enter Session ID (e.g. 1)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Zoom CSV File</label>
                            <div className="file-input-container">
                            <input 
                                type="file" 
                                id="file" 
                                accept=".csv"
                                onChange={handleFileChange}
                                className="file-input-hidden"
                            />
                            <label htmlFor="file" className="file-input-label">
                                {file ? file.name : "Choose CSV File"}
                            </label>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Processing..." : "Upload and Take Attendance"}
                        </button>
                        <button type="button" className="secondary-btn" onClick={() => navigate("/zoom-check")}>
                            Check Unmatched Participants
                        </button>
                    </form>

                    {status && (
                        <div className={`status-message ${status.type}`}>
                            {status.msg}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}