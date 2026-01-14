import React from "react";
import { Link } from "react-router-dom";
import "./attendance.css"; 

export default function HiWiStatisticsPage() {
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
                <h1>Attendance</h1>

                <div className="cards">
                    <div className="card">
                        <h2>Day 1</h2>
                    </div>

                    <div className="card">
                        <h2>Day 2</h2>
                    </div>

                    <div className="card">
                        <h2>Day 3</h2>
                    </div>

                    <div className="card">
                        <h2>Day 4</h2>
                    </div>
                </div>
            </main>
        </div>
    );
}
