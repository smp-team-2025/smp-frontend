import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./student_homepage.css";

export default function StudentHomePage(){
    const navigate = useNavigate();
    const username = "User";
    const [availableQuizSessionId, setAvailableQuizSessionId] = useState<number | null>(null);
    useEffect(() => {
        // Fetch available quiz sessions
        const fetchQuizSessions = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("/api/events/1/sessions", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const sessions = await res.json();
                    // Find first session with a quiz
                    const sessionWithQuiz = sessions.find((s: any) => s.fermiQuiz);
                    if (sessionWithQuiz) {
                        setAvailableQuizSessionId(sessionWithQuiz.id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch quiz sessions:", error);
            }
        };
        fetchQuizSessions();
    }, []);


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

                {availableQuizSessionId ? (
                    <Link to={`/quiz/session/${availableQuizSessionId}`} className="card">
                        <h2>Fermi Quiz</h2>
                        <p>Answer Fermi questions</p>
                    </Link>
                ) : (
                    <div className="card" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                        <h2>Fermi Quiz</h2>
                        <p>No quiz available</p>
                    </div>
                )}

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

                <Link to="/studenthomepage/diplomas" className="card">
                            <h2>Diploma</h2>
                            <p>Download your participation diploma</p>
                </Link>


    

                <a href="#" className="card">
                    <h2>Certificates</h2>
                    <p>Generate participation certificates</p>
                </a>

                

            </div>
        </main>

    </div>
    );
    
}