import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./forgot-password.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="forgot-password-page">
      <div className="forgot-container">
        <h2>Passwort vergessen</h2>
        <p>
          Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum
          Zurücksetzen des Passworts.
        </p>

        <input
          type="email"
          placeholder="E-Mail-Adresse eingeben"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button>Link zum Zurücksetzen senden</button>

        {message && <p>{message}</p>}

        <Link to="/login" className="back-link">
          ← Zurück zum Login
        </Link>
      </div>
    </div>
  );
}
