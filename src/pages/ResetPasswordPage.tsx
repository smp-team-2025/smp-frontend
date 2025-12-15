import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./reset-password.css";

export default function ResetPasswordPage(){

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("Die Passwörter stimmen nicht überein.");
            return;
        }

        if(newPassword.length < 8){
            setMessage("Das Passwort muss mindestens 8 Zeichen lang sein.");
            return;
        }
        setMessage("Passwort erfolgreich geändert.")
        setNewPassword("");
        setConfirmPassword("");
    }

    return (
        <div className="reset-password-page">
            <div className="reset-container">
                <h1>Passwort zurücksetzen</h1>

                <p className="intro">
                    Bitte geben Sie Ihr neues Passwort ein und bestätigen Sie es anschließend.
                </p>

                <form onSubmit = {handleSubmit}>

                    <label>Neues Passwort</label>
                                <input
                                    type="password"
                                    placeholder="Neues Passwort"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                    

                    <label>Passwort bestätigen</label>
                                <input
                                    type="password"
                                    placeholder="Passwort bestätigen"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />

                    <button type="submit" className="reset-btn">Passwort ändern</button>

                </form>

                {message && <p>{message}</p>}
                
                <Link to="/login" className="back-link">
                    ← Zurück zum Login
                </Link>

            </div>
        </div>
    );
}