import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./hiwilist.css";

interface HiWi {
    id: number;
    clothingSize: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export default function HiWiListPage(){
    const navigate = useNavigate();
    const [hiwis, setHiwis] = useState<HiWi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchHiwis();
    }, []);

    const fetchHiwis = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const res = await fetch("/api/hiwis", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setHiwis(data);
            } else {
                setError("Failed to load HiWis.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load HiWis.");
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>

                <div className="nav-right">
                    <Link to="/ohomepage" className="back-btn">
                         ← Dashboard
                    </Link>
                                        
                    <Link to="/login" className="logout-btn">
                        Logout
                    </Link>
                </div>
            </header>

            <main className="container">
                <h1>HiWi Details</h1>

                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

                {!loading && !error && hiwis.length === 0 && <p>No HiWis found.</p>}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                    {hiwis.map((hiwi) => (
                        <div key={hiwi.id} className="detail-card">
                            <h2>{hiwi.user.name}</h2>
                            <p><strong>Email:</strong> {hiwi.user.email}</p>
                            <p><strong>Clothing Size:</strong> {hiwi.clothingSize || "N/A"}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}