import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./attendance.css";
import { getActiveEvent } from "../api/event";

interface Session {
  id: number;
  title: string;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
}

interface Attendance {
  id: number;
  participantId: number;
  sessionId: number;
  scannedAt: string;
  participant: {
    id: number;
    name: string;
    email: string;
    qrId: string;
  };
  scannedByHiwi?: {
    id: number;
    user: {
      id: number;
      name: string;
    };
  } | null;
}

interface Participant {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export default function AttendanceData() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const token = localStorage.getItem("token");

  const headers = useMemo(() => {
    const h = new Headers();
    if (token) h.set("Authorization", `Bearer ${token}`);
    return h;
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      await Promise.all([fetchSessions(), fetchParticipants()]);
      setLoading(false);
    })();
  }, []);

  const fetchSessions = async () => {
    try {
      const active = await getActiveEvent(headers);

      const res = await fetch(`/api/events/${active.id}/sessions`, { headers });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to fetch sessions (${res.status}) ${txt}`);
      }

      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setSessions([]);
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await fetch("/api/users", { headers });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to fetch participants (${res.status}) ${txt}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setParticipants(list.filter((u: any) => u.role === "PARTICIPANT"));
    } catch (err) {
      console.error("Failed to fetch participants:", err);
      setParticipants([]);
    }
  };

  const fetchAttendance = async (sessionId: number) => {
    setLoadingAttendance(true);
    try {
      const active = await getActiveEvent(headers);

      const res = await fetch(`/api/events/${active.id}/sessions/${sessionId}/attendance`, {
        headers,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to fetch attendance (${res.status}) ${txt}`);
      }

      const data = await res.json();
      setAttendances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      setAttendances([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleSessionClick = (sessionId: number) => {
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
      setAttendances([]);
      setShowAddForm(false);
      return;
    }

    setSelectedSessionId(sessionId);
    setShowAddForm(false);
    setSelectedParticipantId(null);
    fetchAttendance(sessionId);
  };

  const handleAddAttendance = async () => {
    if (!selectedParticipantId || !selectedSessionId) return;

    const res = await fetch("/api/attendance/manual", {
      method: "POST",
      headers: {
        ...Object.fromEntries(headers.entries()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participantId: selectedParticipantId,
        sessionId: selectedSessionId,
      }),
    });

    if (res.ok) {
      await fetchAttendance(selectedSessionId);
      setShowAddForm(false);
      setSelectedParticipantId(null);
      return;
    }

    const data = await res.json().catch(() => ({}));
    alert(data.error || "Failed to add attendance");
  };

  const handleRemoveAttendance = async (attendanceId: number) => {
    if (!confirm("Are you sure you want to remove this attendance record?")) return;

    const res = await fetch(`/api/attendance/${attendanceId}`, {
      method: "DELETE",
      headers,
    });

    if (res.ok) {
      if (selectedSessionId) await fetchAttendance(selectedSessionId);
      return;
    }

    const data = await res.json().catch(() => ({}));
    alert(data.error || "Failed to remove attendance");
  };

  return (
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
        <h1>Attendance Data</h1>

        {!token ? (
          <p>Bitte zuerst einloggen.</p>
        ) : loading ? (
          <p>Loading sessions...</p>
        ) : (
          <div
            className="sessions-container"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            {sessions.map((session) => (
              <div
                key={session.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  cursor: selectedSessionId === session.id ? "default" : "pointer",
                }}
              >
                <div onClick={() => handleSessionClick(session.id)} style={{ cursor: "pointer" }}>
                  <h2 style={{ margin: "0 0 8px 0", fontSize: "1.5rem" }}>{session.title}</h2>
                  <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>
                    {new Date(session.startsAt).toLocaleString("de-DE")}
                  </p>
                </div>

                {selectedSessionId === session.id && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "15px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                    }}
                  >
                    {loadingAttendance ? (
                      <p>Loading attendance...</p>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <h4>Attendance Records ({attendances.length})</h4>
                          <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            {showAddForm ? "Cancel" : "+ Add Manual"}
                          </button>
                        </div>

                        {showAddForm && (
                          <div
                            style={{
                              marginBottom: "15px",
                              padding: "10px",
                              backgroundColor: "white",
                              borderRadius: "4px",
                            }}
                          >
                            <select
                              value={selectedParticipantId || ""}
                              onChange={(e) => setSelectedParticipantId(Number(e.target.value))}
                              style={{
                                width: "100%",
                                padding: "8px",
                                marginBottom: "8px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                              }}
                            >
                              <option value="">Select participant...</option>
                              {participants
                                .filter((p) => !attendances.some((a) => a.participantId === p.id))
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.email})
                                  </option>
                                ))}
                            </select>

                            <button
                              onClick={handleAddAttendance}
                              disabled={!selectedParticipantId}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: selectedParticipantId ? "#007bff" : "#ccc",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: selectedParticipantId ? "pointer" : "not-allowed",
                              }}
                            >
                              Add Attendance
                            </button>
                          </div>
                        )}

                        {attendances.length === 0 ? (
                          <p>No attendance records yet.</p>
                        ) : (
                          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {attendances.map((att) => (
                              <div
                                key={att.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "8px",
                                  marginBottom: "5px",
                                  backgroundColor: "white",
                                  borderRadius: "4px",
                                  fontSize: "0.9rem",
                                }}
                              >
                                <div>
                                  <strong>{att.participant.name}</strong>
                                  <br />
                                  <span style={{ color: "#666", fontSize: "0.8rem" }}>
                                    {new Date(att.scannedAt).toLocaleString("de-DE")}
                                    {att.scannedByHiwi && ` • by ${att.scannedByHiwi.user.name}`}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRemoveAttendance(att.id)}
                                  style={{
                                    padding: "4px 8px",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}