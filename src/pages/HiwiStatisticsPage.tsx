import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveEvent } from "../api/event";
import "./attendance.css";

interface HiwiSession {
  id: number;
  sessionId: number;
  hiwiId: number;
  assignedAt?: string;
  session: {
    id: number;
    title: string;
    startsAt: string;
    endsAt?: string | null;
    location?: string | null;
    event?: {
      id: number;
      title: string;
    };
  };
}

interface AttendanceRecord {
  id: number;
  scannedAt: string;
  participantId: number;
  sessionId: number;
  participant: {
    id: number;
    name: string;
    email: string;
    qrId?: string;
  };
  scannedByHiwi?: {
    id: number;
    user: {
      id: number;
      name: string;
    };
  } | null;
}

export default function HiwiStatisticsPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<HiwiSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeEventId, setActiveEventId] = useState<number | null>(null);

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      const activeEvent = await getActiveEvent(headers);
      setActiveEventId(activeEvent.id);

      const res = await fetch("/api/hiwis/sessions", {
        headers,
      });

      if (!res.ok) {
        throw new Error("Failed to load HiWi sessions.");
      }

      const data: HiwiSession[] = await res.json();

      const filtered = data
        .filter((item) => item.session?.event?.id === activeEvent.id)
        .sort(
          (a, b) =>
            new Date(a.session.startsAt).getTime() -
            new Date(b.session.startsAt).getTime()
        );

      setSessions(filtered);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load HiWi statistics.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendanceForSession(sessionId: number) {
    if (!activeEventId) return;

    try {
      setLoadingAttendance(true);
      setAttendanceError("");

      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/events/${activeEventId}/sessions/${sessionId}/attendance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Attendance data could not be loaded.");
      }

      const data = await res.json();
      setAttendanceRecords(data);
    } catch (err: any) {
      console.error(err);
      setAttendanceError(err.message || "Failed to load attendance data.");
      setAttendanceRecords([]);
    } finally {
      setLoadingAttendance(false);
    }
  }

  async function handleSessionClick(sessionId: number) {
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
      setAttendanceRecords([]);
      setAttendanceError("");
      return;
    }

    setSelectedSessionId(sessionId);
    await fetchAttendanceForSession(sessionId);
  }

  function formatDateTime(value: string) {
    return new Date(value).toLocaleString("de-DE");
  }

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
        <h1>HiWi Statistiken</h1>

        {loading ? (
          <p>Loading sessions...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : sessions.length === 0 ? (
          <p>No assigned sessions found for the active event.</p>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                justifyContent: "center",
                marginTop: "30px",
              }}
            >
              {sessions.map((item) => {
                const session = item.session;
                const isSelected = selectedSessionId === session.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSessionClick(session.id)}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      padding: "24px",
                      minWidth: "260px",
                      maxWidth: "320px",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                      borderLeft: "6px solid #2f67c7",
                      cursor: "pointer",
                      transition: "0.2s ease",
                      outline: isSelected ? "2px solid #2f67c7" : "none",
                    }}
                  >
                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom: "12px",
                        textAlign: "center",
                        color: "#2f67c7",
                      }}
                    >
                      {session.title}
                    </h2>

                    <p style={{ margin: "8px 0", textAlign: "center", color: "#666" }}>
                      {formatDateTime(session.startsAt)}
                    </p>

                    {session.location && (
                      <p style={{ margin: "8px 0", textAlign: "center", color: "#666" }}>
                        {session.location}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedSessionId && (
              <div
                style={{
                  marginTop: "40px",
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  maxWidth: "900px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <h2 style={{ marginTop: 0 }}>Attendance Data</h2>

                {loadingAttendance && <p>Loading attendance...</p>}

                {attendanceError && (
                  <p style={{ color: "red" }}>{attendanceError}</p>
                )}

                {!loadingAttendance &&
                  !attendanceError &&
                  attendanceRecords.length === 0 && (
                    <p>No attendance records found for this session.</p>
                  )}

                {!loadingAttendance &&
                  !attendanceError &&
                  attendanceRecords.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        marginTop: "20px",
                      }}
                    >
                      {attendanceRecords.map((record) => (
                        <div
                          key={record.id}
                          style={{
                            padding: "14px",
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <div style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {record.participant.name}
                          </div>

                          <div style={{ color: "#555", marginTop: "4px" }}>
                            {record.participant.email}
                          </div>

                          <div
                            style={{
                              color: "#777",
                              fontSize: "0.9rem",
                              marginTop: "8px",
                            }}
                          >
                            Scanned at: {formatDateTime(record.scannedAt)}
                          </div>

                          {record.scannedByHiwi && (
                            <div
                              style={{
                                color: "#777",
                                fontSize: "0.9rem",
                                marginTop: "4px",
                              }}
                            >
                              Scanned by: {record.scannedByHiwi.user.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}