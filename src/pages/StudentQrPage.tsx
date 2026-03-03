import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { qrApi } from "../api/qr";
import "./studentqr.css";

export default function StudentQrPage(){
    const [username, setUsername] = useState<string>("User");
    const [qrSrc, setQrSrc] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const user = await qrApi.getMe();
                setUsername(user.name);

                const src = await qrApi.getUserQrCode(user.id);
                setQrSrc(src);
            } catch (err: any) {
                setError("QR-Code konnte nicht geladen werden");
            }
        };
        loadData();
    }, []);

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
                <h1>Mein QR-Code</h1>
                <p className="subtitle">Zeigen Sie diesen QR-Code am Eingang</p>

                <div className="qr-card">
                    {error ? (
                        <p style={{ color: "red" }}>{error}</p>
                    ) : qrSrc ? (
                        <img src={qrSrc} alt="QR Code" />
                    ) : (
                        <p>QR-Code wird geladen...</p>
                    )}
                    <p className="student-name">{username}</p>
                </div>
            </main>
        </div>
    );
}