import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ohomepage.css";

export default function OHomePage() {
    const navigate = useNavigate();
    const username = "Organizer";
    {/* useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
            navigate("/login");
        } else if (role !== "Organizer") {
            if (role === "Student") {
                navigate("/studenthomepage");
            } else if (role === "Hiwi") {
                navigate("/hiwihomepage");
            } else {
                navigate("/login");
            }
        }
    }, [navigate]);
        */}

    

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <div className="nav-left">
                    <span className="logo">SMP 2026</span>
                </div>

                <Link to="/login" className="logout-btn">
                    Logout
                </Link>
            </header>

            <main className="container">
                <h1>Organizer Dashboard</h1>

                <p className="greeting">
                    Hallo, {username}!
                </p>

                <div className="cards">
                    <Link to="/ohomepage/eventlist" className="card">
                        <h2>Event Management</h2>
                        <p>Create and manage events</p>
                    </Link>
                    
                    <Link to="/ohomepage/sessionlist" className="card">
                        <h2>Session Management</h2>
                        <p>Create and edit event sessions</p>
                    </Link>


                    <Link to="/ohomepage/hiwilist" className="card">
                         <h2>HiWi Management</h2>
                         <p>Approve and manage student assistants</p>
                    </Link>


                    <Link to="/ohomepage/quizlist" className="card">
                            <h2>Fermi Quiz</h2>
                            <p>Create and manage quizzes</p>
                    </Link>

                    <Link to="/ohomepage/statistics" className="card">
                             <h2>Statistics</h2>
                            <p>View participation statistics</p>
                    </Link>

                    <Link to="/ohomepage/attendance" className="card">
                        <h2>Attendance Data</h2>
                        <p>View 7-day attendance logs</p>
                    </Link>

                    <Link to="/ohomepage/announcements" className="card">
                        <h2>Announcements</h2>
                        <p>Create and list announcements</p>
                    </Link>

                </div>
            </main>
        </div>
    );
}