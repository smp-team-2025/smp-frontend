import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { qrApi } from "../api/qr";
import "./businesscard.css";

export default function BusinessCardPage(){
    const [user, setUser] = useState<{ id: number; name: string; role: string } | null>(null);
    const [qrUrl, setQrUrl] = useState<string>("");

    useEffect(() => {
        async function loadData() {
            try {
                const me = await qrApi.getMe();
                setUser(me);
                const url = await qrApi.getUserQrCode(me.id);
                setQrUrl(url);
            } catch (e) {
                console.error("Failed to load data", e);
            }
        }
        loadData();
    }, []);

    const handleDownload = async () => {
        if (!user) return;
        try {
            const pdfUrl = await qrApi.getBusinessCardPdf(user.id);
            window.open(pdfUrl, "_blank");
        } catch (e) {
            console.error("Failed to download PDF", e);
        }
    };

    if (!user) return <div className="page-wrapper">Loading...</div>;

    return(
        <div className="page-wrapper">
            <header className="navbar">
                <span className="nav-logo">SMP 2026</span>

                <Link to="/studenthomepage" className="back-btn">← Dashboard</Link>
            </header>

            <main className="card-wrapper">
                <div className="business-card">
                    {/* LEFT BLUE PATZ */}
                    <div className="left-strip">
                        <span>SMP<br />2026</span>
                    </div>

                    {/* CENTER INFO */}
                    <div className="info">
                        <h2>{user.name}</h2>
                        <p className="role">{user.role}</p>
                        <p className="event">Science Day 2026</p>
                    </div>

                    {/* QR */}
                    {qrUrl && <img src={qrUrl} alt="QR Code" className="qr" />}
                </div>

                <button onClick={handleDownload} className="print-btn">
                    Download PDF
                </button>
            </main>

        </div>
    );
}