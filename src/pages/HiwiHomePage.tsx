import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./hiwihome.css";
import { getActiveEvent } from "../api/event";
import { checkAuthAndRedirect } from "../utils/auth";
import { getMe } from "../api/auth";

export default function HiwiHomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  useEffect(() => {
    const ok = checkAuthAndRedirect(navigate);
    if (!ok) return;

    const role = localStorage.getItem("role");
    if (role !== "HIWI") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    getMe({ Authorization: `Bearer ${localStorage.getItem("token")}` })
      .then((me) => setName(me.name))
      .catch(() => setName(""));
  }, []);

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <span className="logo">SMP 2026</span>
        <Link to="/login" className="logout-btn">Logout</Link>
      </header>

      <main className="container">
        <h1>Dashboard</h1>
        <p className="greeting">Hallo, {name}! 👋</p>

        <div className="cards">
          <Link to="/hiwihomepage/sessions" className="card">
            <h2>Meine Sessions</h2>
            <p>Zugewiesene Sessions anzeigen</p>
          </Link>

          <Link to="/hiwihomepage/scan" className="card">
            <h2>QR Code Check-in</h2>
            <p>QR-Codes der Teilnehmer scannen</p>
          </Link>

          <Link to="/hiwihomepage/statistics" className="card">
            <h2>Anwesenheit</h2>
            <p>Anwesenheitsprotokolle anzeigen</p>
          </Link>

          {/* 🔥 BURASI */}
          <Link to="/hiwihomepage/availability" className="card">
            <h2>Verfügbarkeit</h2>
            <p>Für Sessions eintragen</p>
          </Link>

          <Link to="/hiwiannouncements" className="card">
            <h2>Ankündigungen</h2>
            <p>Ankündigungen anzeigen</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
