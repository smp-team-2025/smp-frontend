import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./hiwihome.css";

export default function HiwiHomePage(){
    const navigate = useNavigate();
    const username = "Hiwi";
    {/* 
        useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
            navigate("/login");
        } else if (role !== "Hiwi") {
            if (role === "Organizer") {
                navigate("/ohomepage");
            } else if (role === "Student") {
                navigate("/studenthomepage");
            } else {
                navigate("/login");
            }
        }
    }, [navigate]);*/}
    

    return(
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>
                <div className="nav-right">
                    <Link to="/login" className="logout-btn"> Logout </Link>
                </div>
            </header>

            <main className="container">

                <h1>Dashboard</h1>
                <p className="greeting">Hallo, {username}! 👋</p>

                <div className="cards">

                    {/* MY SESSIONS */}
                    <Link to="/hiwihomepage/sessions" className="card">
                        <h2>My Sessions</h2>
                        <p>View assigned sessions</p>
                    </Link>

                    {/* QR CODE */}
                    <Link to="/hiwihomepage/scan" className="card">
                        <h2>QR Code Check-in</h2>
                        <p>Scan participant QR codes</p>
                    </Link>

                    {/* ATTENDANCE */}
                    <Link to="/hiwihomepage/statistics" className="card"> 
                        <h2>Attendance</h2>
                        <p>View attendance logs</p>
                    </Link>

                    <Link to="/hiwiannouncements" className="card"> 
                        <h2>Announcements</h2>
                        <p>View announcements</p>
                    </Link>
                        
                    

                </div>

            </main>
        </div>
    );

}