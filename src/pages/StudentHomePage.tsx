import { Link } from "react-router-dom";
import "./student_homepage.css";

export default function StudentHomePage(){
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

                <a href="../organizer/quizlist.html" className="card">
                    <h2>Fermi Quiz</h2>
                    <p>Create and manage quizzes</p>
                </a>

                <Link to="/studenthomepage/qr" className="card">
                          <h2>QR Code Check-in</h2>
                          <p>Attendance via QR scanning</p>
                </Link>

                <a href="../organizer/statistics.html" className="card">
                    <h2>Statistics</h2>
                    <p>View results and analytics</p>
                </a>

                <a href="#" className="card">
                    <h2>Certificates</h2>
                    <p>Generate participation certificates</p>
                </a>

                <a href="#" className="card">
                    <h2>Email Notifications</h2>
                    <p>Send updates automatically</p>
                </a>

            </div>
        </main>

    </div>
    );
    
}