import React from "react";
import { Link } from "react-router-dom";
import "./quizlist.css";

export default function QuizListPage(){
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
                <h1>Fermi Quiz</h1>

                <div className="top-actions">
                    <a href="#" className="create-btn">+ Create Quiz</a>
                </div>

                <div className="cards">
                    <div className="card">
                        <h2>How many piano tuners are in Germany?</h2>
                        <p>Status: Draft</p>
                    </div>

                    <div className="card">
                        <h2>How many pizzas are eaten per day?</h2>
                        <p>Status: Published</p>
                    </div>
                </div>
            </main>
        </div>
    );
}