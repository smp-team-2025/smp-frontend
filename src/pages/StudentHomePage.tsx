import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./student_homepage.css";

export default function StudentHomePage(){
    const navigate = useNavigate();
    const username = "User";


    return(
        <div className="page-wrapper">
        <header className="navbar">
            <div className="nav-left">
                <span className="logo">SMP 2026</span>
            </div>

            <div className="nav-right">
                <Link to="/login" className="logout-btn"> Logout </Link>
            </div>
        </header>

        <main className="container">
            <h1>Dashboard</h1>
            <p className="greeting">
                Hallo, {username}! <span className="wave">👋</span>
            </p>

            <div className="cards">

                <Link to="/studenthomepage/calendar" className="card">
                    <h2>My Calendar</h2>
                    <p>View upcoming sessions</p>
                </Link>

                <Link to="/student/quiz-sessions" className="card">
                    <h2>Fermi Quiz</h2>
                    <p>Select a quiz session</p>
                </Link>

                <Link to="/studenthomepage/qr" className="card">
                          <h2>QR Code Check-in</h2>
                          <p>Attendance via QR scanning</p>
                </Link>

                <Link to="/studenthomepage/businesscard" className="card-link">
                          <div className="card">
                            <h2>Business Card</h2>
                            <p>Print participant QR cards</p>
                        </div>
                </Link>


                <Link to="/studenthomepage/attendance" className="card">
                            <h2>My Attendance</h2>
                            <p>View your attendance for all sessions</p>
                </Link>

                <Link to="/studentannouncements" className="card">
                            <h2>Ankündigungen</h2>
                            <p>Öffentliche Ankündigungen ansehen</p>
                </Link>

    

                

            </div>
        </main>

    </div>
    );
    
}