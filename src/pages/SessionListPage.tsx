import React from "react";
import { Link } from "react-router-dom";
import "./sessionlist.css";

export default function SessionListPage(){
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
                    <a href="session-form.html" className="create-btn">+ Create Session</a>
                </div>

                <div className="cards">
                    <div className="card">
                        <h2>Morning Session</h2>
                        <p>09:00 – 11:00</p>
                    </div>

                    <div className="card">
                        <h2>Afternoon Session</h2>
                        <p>13:00 – 15:00</p>
                    </div>
                </div>
            </main>
        </div>
    );

}