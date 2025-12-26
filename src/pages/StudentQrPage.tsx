import { Link } from "react-router-dom";
import "./studentqr.css";

export default function StudentQrPage(){
    const username = "User";
    return(
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>
                <div className="nav-right">
                    <Link to="/studenthomepage" className="back-btn"> 
                        ← Dashboard
                    </Link>
                    
                    <Link to="/login" className="logout-btn"> 
                       Logout
                    </Link>
                </div>
            </header>

            <main className="qr-container">
                <h1>My QR Code</h1>
                <p className="subtitle">Show this QR code at the entrance</p>

                <div className="qr-card">
                    <img src="qr-placeholder.png" alt="QR Code" />
                    <p className="student-name">Student: {username}</p>
                </div>
            </main>
        </div>
    );
}