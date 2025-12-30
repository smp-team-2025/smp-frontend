import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { qrApi } from "../api/qr";
import "./attendance.css";

interface Participant {
    id: number;
    name: string;
    email: string;
    checkInTime?: string;
}

interface DayStats {
    date: string;
    participants: Participant[];
}

export default function AttendanceData() {
    const [days, setDays] = useState<DayStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
     useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await qrApi.getAttendanceStats();
                setDays(data);
            } catch (err) {
                setError("Failed to load attendance data.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>
                <div className="nav-right">
                    <Link to="/ohomepage" className="back-btn">
                        ← Dashboard
                    </Link>
                </div>
            </header>

            <main className="attendance-container">
                <h1>Attendance Overview</h1>
                <p className="subtitle">Last 7 Days</p>

                {loading && <p>Loading data...</p>}
                {error && <p className="error-msg">{error}</p>}

                {!loading && !error && days.length === 0 && (
                    <p>No attendance records found.</p>
                )}

                <div className="days-list">
                    {days.map((day, idx) => (
                        <div key={idx} className="day-card">
                            <div className="day-header">
                                <h2>Day {idx + 1}</h2>
                                <span className="date-label">{day.date}</span>
                                <span className="count-badge">
                                    {day.participants.length} Present
                                </span>
                            </div>
                            
                            {day.participants.length > 0 ? (
                                <ul className="participant-list">
                                    {day.participants.map((p) => (
                                        <li key={p.id} className="participant-item">
                                            <span className="p-name">{p.name}</span>
                                            <span className="p-email">{p.email}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-participants">No participants yet.</p>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}