
import { Link } from "react-router-dom";
import "./hiwihome.css";

export default function HiwiHomePage(){
    const username = "Hiwi";

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

                    {/* QR CODE */}
                    <a href="??" className="card">
                        <h2>QR Code Check-in</h2>
                        <p>Scan participant QR codes</p>
                    </a>

                    {/* STATISTICS */}
                    <Link to="/hiwihomepage/statistics" className="card"> 
                        <h2>Statistics</h2>
                        <p>View attendance statistics</p>
                    </Link>
                        
                    

                </div>

            </main>
        </div>
    );

}