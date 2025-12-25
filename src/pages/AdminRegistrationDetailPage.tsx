import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./admin.css";

interface Registration {
  id: number;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  street: string;
  addressExtra?: string;
  zipCode: string;
  city: string;
  school: string;
  grade: string;
  motivation?: string;
  comments?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function AdminRegistrationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistration();
    if (checkAuthAndRedirect(navigate)) {
      fetchRegistration();
    }
  }, [id]);

  async function fetchRegistration() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bitte zuerst einloggen");
        navigate("/login");
        return;
      }

      const res = await fetch(`/api/registrations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setRegistration(data);
      } else {
        alert("Fehler beim Laden der Registrierung");
      }
    } catch (error) {
      alert("Fehler: " + error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!confirm("Diese Anmeldung genehmigen?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/registrations/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Anmeldung genehmigt! Benutzer wurde erstellt.");
        fetchRegistration();
      } else {
        alert("Fehler beim Genehmigen");
      }
    } catch (error) {
      alert("Fehler: " + error);
    }
  }

  async function handleReject() {
    if (!confirm("Diese Anmeldung ablehnen?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/registrations/${id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Anmeldung abgelehnt.");
        fetchRegistration();
      } else {
        alert("Fehler beim Ablehnen");
      }
    } catch (error) {
      alert("Fehler: " + error);
    }
  }

  if (loading) return <div className="admin-container">Laden...</div>;
  if (!registration)
    return <div className="admin-container">Registrierung nicht gefunden</div>;

  return (
    <div className="admin-container">
      <button className="btn-back" onClick={() => navigate("/admin/registrations")}>
        ← Zurück zur Liste
      </button>

      <h1>Registrierung Details</h1>

      <div className="detail-card">
        <div className="detail-header">
          <h2>
            {registration.firstName} {registration.lastName}
          </h2>
          <span className={`status-badge status-${registration.status.toLowerCase()}`}>
            {registration.status}
          </span>
        </div>

        <div className="detail-section">
          <h3>Persönliche Informationen</h3>
          <p>
            <strong>Anrede:</strong> {registration.salutation}
          </p>
          <p>
            <strong>E-Mail:</strong> {registration.email}
          </p>
        </div>

        <div className="detail-section">
          <h3>Adresse</h3>
          <p>
            <strong>Straße:</strong> {registration.street}
          </p>
          {registration.addressExtra && (
            <p>
              <strong>Zusatz:</strong> {registration.addressExtra}
            </p>
          )}
          <p>
            <strong>PLZ / Stadt:</strong> {registration.zipCode} {registration.city}
          </p>
        </div>

        <div className="detail-section">
          <h3>Schule</h3>
          <p>
            <strong>Schule:</strong> {registration.school}
          </p>
          <p>
            <strong>Klasse:</strong> {registration.grade}
          </p>
        </div>

        {registration.motivation && (
          <div className="detail-section">
            <h3>Motivation</h3>
            <p>{registration.motivation}</p>
          </div>
        )}

        {registration.comments && (
          <div className="detail-section">
            <h3>Kommentare</h3>
            <p>{registration.comments}</p>
          </div>
        )}

        <div className="detail-section">
          <p>
            <strong>Erstellt am:</strong>{" "}
            {new Date(registration.createdAt).toLocaleString("de-DE")}
          </p>
        </div>

        {registration.status === "PENDING" && (
          <div className="action-buttons">
            <button className="btn-approve" onClick={handleApprove}>
              ✓ Genehmigen
            </button>
            <button className="btn-reject" onClick={handleReject}>
              ✗ Ablehnen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
