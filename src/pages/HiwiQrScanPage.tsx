import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { qrApi } from "../api/qr";
import "./hiwihome.css";

export default function HiWiQrScanPage() {
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', msg: string } | null>(null);
    const isProcessing = useRef(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
            },
            false
        );

        const onScanSuccess = async (decodedText: string) => {
            if (isProcessing.current) return;
            isProcessing.current = true;

            setStatus({ type: 'info', msg: 'Processing...' });

            try {
                await qrApi.submitScan(decodedText);
                setStatus({ type: 'success', msg: `Success! Attendance recorded.` });
            } catch (err: any) {
                setStatus({ type: 'error', msg: err.message || "Scan failed" });
            } finally {
                // Delay before next scan to prevent double scanning
                setTimeout(() => {
                    isProcessing.current = false;
                    setStatus(null);
                }, 3000);
            }
        };

        scanner.render(onScanSuccess, (err) => { /* ignore errors */ });

        return () => {
            scanner.clear().catch(console.error);
        };
    }, []);

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>
                <div className="nav-right">
                    <Link to="/hiwihomepage" className="back-btn" style={{ color: 'white', marginRight: '15px' }}>
                        ← Dashboard
                    </Link>
                    <Link to="/login" className="logout-btn">Logout</Link>
                </div>
            </header>

            <main className="container">
                <h1>QR Check-in</h1>
                <p className="greeting">Scan student QR code with camera.</p>

                <div className="card" style={{ transform: "none", cursor: "default", maxWidth: "500px", margin: "0 auto" }}>
                    <div id="reader"></div>

                    {status && (
                        <div style={{ marginTop: "20px", padding: "15px", borderRadius: "8px", 
                            backgroundColor: status.type === 'success' ? '#d4edda' : status.type === 'error' ? '#f8d7da' : '#e2e3e5',
                            color: status.type === 'success' ? '#155724' : status.type === 'error' ? '#721c24' : '#383d41' }}>
                            {status.msg}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}