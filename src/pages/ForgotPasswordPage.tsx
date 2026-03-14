import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import "./forgot-password.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await forgotPassword(email);
      setSubmitted(true);
      setMessage(
        result?.message ||
          "Die E-Mail wurde erfolgreich gesendet. Falls Sie keine E-Mail erhalten, prüfen Sie bitte Ihren Spam-Ordner oder stellen Sie sicher, dass Sie Ihre E-Mail-Adresse korrekt eingegeben haben."
      );
    } catch (err: any) {
      setError(err.message || "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-container">
        <h2>Passwort vergessen</h2>

        {!submitted ? (
          <>
            <p>
              Geben Sie Ihre E-Mail-Adresse ein. Wenn ein Konto existiert,
              senden wir Ihnen ein neues Passwort per E-Mail.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="E-Mail-Adresse eingeben"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Wird gesendet..." : "Neues Passwort senden"}
              </button>
            </form>
          </>
        ) : (
          <p className="success-message">{message}</p>
        )}

        {error && <p className="error-message">{error}</p>}

        <Link to="/login" className="back-link">
          ← Zurück zum Login
        </Link>
      </div>
    </div>
  );
}