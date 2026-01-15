import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { qrApi } from "../api/qr";
import { hiwiApi, type HiwiSession } from "../api/hiwi";
import "./hiwihome.css";

export default function HiWiQrScanPage() {
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', msg: string } | null>(null);
    const [sessions, setSessions] = useState<HiwiSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const isProcessing = useRef(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        hiwiApi.getMySessions()
            .then((data) => {
                console.log("Sessions loaded:", data);
                setSessions(data);

                // Otomatik session seçimi
                if (data.length === 0) {
                    setStatus({ type: 'error', msg: 'You have no assigned sessions' });
                    return;
                }

                // Bugünkü sessionları bul
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todaySessions = data.filter(item => {
                    const sessionDate = new Date(item.session.startsAt);
                    return sessionDate >= today && sessionDate < tomorrow;
                });

                // Eğer bugün bir session varsa otomatik seç
                if (todaySessions.length === 1) {
                    setSelectedSessionId(todaySessions[0].session.id);
                    setStatus({ type: 'info', msg: `Auto-selected today's session: ${todaySessions[0].session.title}` });
                    setTimeout(() => setStatus(null), 3000);
                } else if (todaySessions.length > 1) {
                    // Birden fazla varsa ilkini seç
                    setSelectedSessionId(todaySessions[0].session.id);
                    setStatus({ type: 'info', msg: `Multiple sessions today. Selected: ${todaySessions[0].session.title}` });
                    setTimeout(() => setStatus(null), 3000);
                } else if (data.length === 1) {
                    // Bugün yok ama tek session varsa onu seç
                    setSelectedSessionId(data[0].session.id);
                    setStatus({ type: 'info', msg: `Auto-selected session: ${data[0].session.title}` });
                    setTimeout(() => setStatus(null), 3000);
                }
                // Birden fazla session var ve bugün değillerse dropdown göster
            })
            .catch((err) => {
                console.error("Failed to load sessions:", err);
                setStatus({ type: 'error', msg: 'Failed to load sessions: ' + err.message });
            });
    }, []);

    useEffect(() => {
        if (!selectedSessionId) {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
            return;
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            },
            false
        );
        scannerRef.current = scanner;

        const onScanSuccess = async (decodedText: string) => {
            if (isProcessing.current) return;
            isProcessing.current = true;

            setStatus({ type: 'info', msg: 'Processing...' });

            try {
                const qrId = decodedText.replace('smp:', '');
                const token = localStorage.getItem("token");

                const response = await fetch("http://localhost:3000/api/attendance/scan", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        qrId: qrId,
                        sessionId: selectedSessionId
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Scan failed");
                }

                setStatus({ type: 'success', msg: `Success! Attendance recorded.` });
            } catch (err: any) {
                setStatus({ type: 'error', msg: err.message || "Scan failed" });
            } finally {
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
    }, [selectedSessionId]);

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
                <p className="greeting">Select a session and scan student QR code.</p>

                <div style={{
                    maxWidth: "600px",
                    margin: "0 auto",
                    padding: "30px",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                    <div style={{ marginBottom: "30px" }}>
                        <label style={{ display: "block", marginBottom: "10px", fontWeight: "600", fontSize: "14px", color: "#333" }}>
                            Select Session:
                        </label>
                        <select
                            value={selectedSessionId?.toString() || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedSessionId(val ? Number(val) : null);
                            }}
                            style={{
                                width: "100%",
                                padding: "12px 15px",
                                fontSize: "16px",
                                borderRadius: "8px",
                                border: "2px solid #e0e0e0",
                                backgroundColor: "#fff",
                                cursor: "pointer",
                                outline: "none",
                                appearance: "auto"
                            }}
                        >
                            <option value="">-- Choose a session --</option>
                            {sessions.map((item) => (
                                <option key={item.id} value={item.session.id.toString()}>
                                    {item.session.title} - {new Date(item.session.startsAt).toLocaleDateString("de-DE")}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedSessionId ? (
                        <div id="reader"></div>
                    ) : (
                        <p style={{ textAlign: "center", color: "#999", padding: "40px 20px", fontSize: "15px" }}>
                            Please select a session to start scanning
                        </p>
                    )}

                    {status && (
                        <div style={{
                            marginTop: "20px",
                            padding: "15px 20px",
                            borderRadius: "8px",
                            backgroundColor: status.type === 'success' ? '#d4edda' : status.type === 'error' ? '#f8d7da' : '#e2e3e5',
                            color: status.type === 'success' ? '#155724' : status.type === 'error' ? '#721c24' : '#383d41',
                            fontSize: "14px",
                            fontWeight: "500"
                        }}>
                            {status.msg}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}