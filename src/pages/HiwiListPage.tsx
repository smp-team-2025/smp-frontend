import React from "react";
import { Link } from "react-router-dom";
import "./hiwilist.css";

export default function HiWiListPage(){
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
                <h1>HiWi Details</h1>

                <div className="detail-card">
                    <h2>Max Mustermann</h2>

                    <p><strong>Email:</strong> max.mustermann@tu-darmstadt.de</p>
                    <p><strong>Matriculation No:</strong> 1234567</p>
                    <p><strong>Status:</strong> Pending</p>

                    <div className="actions">
                        <button className="approve-btn">Approve</button>
                        <button className="reject-btn">Reject</button>
                    </div>
                </div>
            </main>
        </div>
    );
}