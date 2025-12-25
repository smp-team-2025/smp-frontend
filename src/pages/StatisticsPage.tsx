import React from "react";
import { Link } from "react-router-dom";
import "./statistics.css";

export default function StatisticsPage(){
    return(
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>

                <div className="nav-right">
                    <Link to="/ohomepage" className="back-btn">← Dashboard</Link>
                    <Link to="/login" className="logout-btn">  Logout </Link>
                </div>
            </header>


            <main className="container">
                <h1>Statistics</h1>

                <div className="stats-grid">
                    <div className="stat-card">
                        <h2>Events</h2>
                        <p className="stat-number">5</p>
                        <span>Total events created</span>
                    </div>

                    <div className="stat-card">
                        <h2>Sessions</h2>
                        <p className="stat-number">18</p>
                        <span>Total sessions</span>
                    </div>

                    <div className="stat-card">
                        <h2>Participants</h2>
                        <p className="stat-number">240</p>
                        <span>Registered students</span>
                    </div>

                    <div className="stat-card">
                        <h2>Fermi Quizzes</h2>
                        <p className="stat-number">7</p>
                        <span>Created quizzes</span>
                    </div>

                    <div className="stat-card">
                        <h2>HiWis</h2>
                        <p className="stat-number">12</p>
                        <span>Student assistants</span>
                    </div>
                </div>
            </main>
        </div>
    );

}