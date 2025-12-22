import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./admin.css";

interface Registration {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function AdminRegistrationsListPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (checkAuthAndRedirect(navigate)) {
      fetchRegistrations();
    }
  }, []);

  async function fetchRegistrations() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bitte zuerst einloggen");
        navigate("/login");
        return;
      }

      const res = await fetch("/api/registrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      } else {
        alert("Fehler beim Laden der Registrierungen");
      }
    } catch (error) {
      alert("Fehler: " + error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const colors = {
      PENDING: "orange",
      APPROVED: "green",
      REJECTED: "red",
    };
    return (
      <span
        style={{
          backgroundColor: colors[status as keyof typeof colors],
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        {status}
      </span>
    );
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  if (loading) return <div className="admin-container">Laden...</div>;

  return (
    <div className="admin-container">
      <button className="btn-back" onClick={handleLogout}>
        ← Abmelden
      </button>
      <h1>Registrierungen Verwalten</h1>
      <p>Alle Anmeldungen für SMP</p>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Schule</th>
            <th>Status</th>
            <th>Datum</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id}>
              <td>{reg.id}</td>
              <td>
                {reg.firstName} {reg.lastName}
              </td>
              <td>{reg.email}</td>
              <td>{reg.school}</td>
              <td>{getStatusBadge(reg.status)}</td>
              <td>{new Date(reg.createdAt).toLocaleDateString("de-DE")}</td>
              <td>
                <button
                  className="btn-view"
                  onClick={() => navigate(`/admin/registrations/${reg.id}`)}
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
