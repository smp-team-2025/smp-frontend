import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveEvent } from "../api/event";
import "./zoomuploadpage.css";

interface Session {
  id: number;
  title: string;
  startsAt: string;
  endsAt?: string | null;
}

export default function ZoomUploadPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchSessions();
  }, [navigate]);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      setStatus(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // active event
      const ev = await getActiveEvent(headers);

      // sessions for active event
      const res = await fetch(`/api/events/${ev.id}/sessions`, { headers });

      if (res.ok) {
        const data: Session[] = await res.json();
        const sortedSessions = data.sort(
          (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
        );
        setSessions(sortedSessions);
      } else {
        setSessions([]);
        setStatus({ type: "error", msg: "Failed to load sessions." });
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setSessions([]);
      setStatus({ type: "error", msg: "Failed to load sessions." });
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !file) {
      setStatus({ type: "error", msg: "Please select a session and provide a CSV file." });
      return;
    }

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("sessionId", selectedSessionId);
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("/api/attendance/zoom/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus({
          type: "success",
          msg: `Success! Matched: ${data.matchedCount}, Unmatched: ${data.unmatchedCount}`,
        });
      } else {
        setStatus({ type: "error", msg: data.error || "Upload failed." });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "An error occurred during upload." });
    } finally {
      setLoading(false);
    }
  };

  const formatSessionLabel = (session: Session) => {
    const date = new Date(session.startsAt).toLocaleDateString("de-DE");
    const time = new Date(session.startsAt).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${session.title} - ${date} ${time}`;
  };

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <div className="nav-left">
          <span className="logo">SMP 2026</span>
        </div>
        <button
          onClick={() => navigate("/ohomepage")}
          className="logout-btn"
          style={{ border: "none", cursor: "pointer" }}
        >
          ← Dashboard
        </button>
      </header>

      <main className="container">
        <h1>Zoom Attendance Upload</h1>
        <div className="upload-card">
          <p>Select a session and upload the Zoom CSV file to process attendance.</p>

          {loadingSessions ? (
            <p>Loading sessions...</p>
          ) : (
            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-group">
                <label htmlFor="sessionSelect">Select Session</label>
                <select
                  id="sessionSelect"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">-- Select a session --</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {formatSessionLabel(session)}
                    </option>
                  ))}
                </select>
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

              <button type="submit" className="submit-btn" disabled={loading || !selectedSessionId || !file}>
                {loading ? "Processing..." : "Upload and Take Attendance"}
              </button>

              <button type="button" className="secondary-btn" onClick={() => navigate("/zoom-check")}>
                Check Unmatched Participants
              </button>
            </form>
          )}

          {status && <div className={`status-message ${status.type}`}>{status.msg}</div>}
        </div>
      </main>
    </div>
  );
}