import React from "react";
import { Link } from "react-router-dom";
import "./eventdetail.css";

export default function EventDetailPage(){
    return(
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>

                <div className="nav-right">
                    <Link to="/ohomepage/eventlist" className="nav-link">
                        ← Events
                    </Link>
                    
                    <Link to="/login" className="logout-btn">
                        Logout
                    </Link>
                </div>
            </header>

            <main className="container">
                <h1>Event Details</h1>

                <div className="event-card">
                    <h2>Science Day 2026</h2>
                    <p><strong>Date:</strong> 12.06.2026</p>
                    <p><strong>Location:</strong> TU Darmstadt</p>
                    <p><strong>Status:</strong> Active</p>
                </div>

                <h2 className="section-title">Sessions</h2>

                <div className="sessions-grid">
                    <div className="session-card">
                        <h3>Opening Session</h3>
                        <p>10:00 – 11:00</p>
                        <p>Room A</p>
                    </div>

                    <div className="session-card">
                        <h3>Workshop AI</h3>
                        <p>11:30 – 13:00</p>
                        <p>Room B</p>
                    </div>

                    <div className="session-card">
                        <h3>Closing Session</h3>
                        <p>15:00 – 16:00</p>
                        <p>Main Hall</p>
                    </div>
                </div>
            </main>
        </div>
    );

}