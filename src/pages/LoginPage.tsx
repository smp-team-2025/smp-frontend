import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function LoginPage(){
    const [email,setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e:React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/auth/login", {

            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),

        });

        const data = await res.json();

        if(res.ok){
            localStorage.setItem("token", data.token);
            alert("Login successful!");

            // Organizer ise admin paneline, değilse başka yere yönlendir
            if(data.user.role === "organizer" || data.user.role === "admin") {
                navigate("/admin/registrations");
            } else {
                // Participant için başka sayfa (şimdilik yok)
                alert("Logged in as participant");
            }
        } else {
            alert(data.error || "Login failed");
        }
    }
    return (
        <div className="page-wrapper">

            {/* Background image for React */}
            <img className="bg-img" src="/department-physics.jpg" />

            <div className="container">
                <h1>SMP – Login</h1>
                <p className="intro">
                    Bitte melden Sie sich mit Ihrer E-Mail und Passwort an.
                </p>

                <form onSubmit={handleLogin}>

                    <div className="form-section">

                        <label>E-Mail</label>
                        <input
                            type="text"
                            placeholder="E-Mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label>Passwort</label>
                        <input
                            type="password"
                            placeholder="Passwort"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div className="remember-forgot">
                            <label>
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="/forgot-password">Forgot Password?</a>
                        </div>

                    </div>

                    <button type="submit" className="submit-btn">Login</button>

                    <div className="register-link">
                        <p>
                            Noch nicht registriert?{" "}
                            <a href="/registration">Register</a>
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
}
