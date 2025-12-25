import React from "react";
import { Link } from "react-router-dom";
import "./businesscard.css";

export default function BusinessCardPage(){
    return(
        <div className="page-wrapper">
            <header className="navbar">
                <span className="nav-logo">SMP 2026</span>

                <Link to="/ohomepage" className="back-btn">← Dashboard</Link>
            </header>

            <main className="card-wrapper">
                <div className="business-card">
                    {/* LEFT BLUE PATZ */}
                    <div className="left-strip">
                        <span>SMP<br />2026</span>
                    </div>

                    {/* CENTER INFO */}
                    <div className="info">
                        <h2>Max Mustermann</h2>
                        <p className="role">Student</p>
                        <p className="event">Science Day 2026</p>
                    </div>

                    {/* QR */}
                    <img src="qr-placeholder.png" alt="QR Code" className="qr" />
                </div>

                <button onClick={() => window.print()} className="print-btn">
                    Print Card
                </button>
            </main>

        </div>
    );
}