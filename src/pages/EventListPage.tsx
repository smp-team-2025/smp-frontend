import React from "react";
import { Link } from "react-router-dom";
import "./eventlist.css";

export default function EventListPage(){

    return(
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>
                <Link to="/ohomepage" className="back">
                ← Dashboard
                </Link>
            </header>

            <main className="container">
                <h1>My Events</h1>

                <div className="event-list">

                    <Link to="/ohomepage/eventdetail" className="event-card">
                        <h2>Introduction Day</h2>
                        <p>10 April 2026</p>
                    </Link>
                    
                    <Link to="/ohomepage/eventdetail" className="event-card">
                        <h2>Fermi Quiz Session</h2>
                        <p>15 April 2026</p>
                    </Link>

                </div>
            </main>

        </div>
        
    );
}