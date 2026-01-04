import React from "react";
import { Link } from "react-router-dom";
import "./eventlist.css";

export default function EventListPage(){

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
                <h1>My Events</h1>

                <div className="event-list">

                    <Link to="/ohomepage/eventdetail" className="event-card">
                        <h2>SMP 2026</h2>
                        
                    </Link>
                    

                </div>
            </main>

        </div>
        
    );
}