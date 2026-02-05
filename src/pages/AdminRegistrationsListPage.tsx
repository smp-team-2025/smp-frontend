import { useEffect, useState } from "react";
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

type ActiveEventDto = {
  id: number;
};

export default function AdminRegistrationsListPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (checkAuthAndRedirect(navigate)) {
      fetchRegistrations();
    }
  }, []);

  async function fetchRegistrations() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      setLoading(true);
      setError(null);

      // Active event
      const evRes = await fetch("/api/events/active", { headers });
      if (!evRes.ok) {
        throw new Error("Aktives Event konnte nicht geladen werden.");
      }
      const ev = (await evRes.json()) as ActiveEventDto;

      // Registrations for active event
      const res = await fetch(`/api/registrations?eventId=${ev.id}`, { headers });
      if (!res.ok) {
        throw new Error("Fehler beim Laden der Registrierungen.");
      }

      const data = (await res.json()) as Registration[];
      setRegistrations(data);
    } catch (e: any) {
      setError(e?.message || "Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: Registration["status"]) {
    const colors = {
      PENDING: "orange",
      APPROVED: "green",
      REJECTED: "red",
    } as const;

    return (
      <span
        style={{
          backgroundColor: colors[status],
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

  const handleApproveAll = async () => {
    const confirmed = window.confirm(
      "Mit diesem Button genehmigen Sie alle ausstehenden Anmeldungen.\n\n" +
      "Sind Sie sicher, dass Sie das tun möchten?"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("/api/registrations/approve-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Fehler beim Genehmigen der Anmeldungen.");
      }

      await fetchRegistrations();
      alert("Alle ausstehenden Anmeldungen wurden genehmigt.");
    } catch (err: any) {
      alert(err?.message || "Fehler beim Genehmigen der Anmeldungen.");
    }
  };

  if (loading) return <div className="admin-container">Laden...</div>;

  return (
    <div className="admin-container">
      <button className="btn-back" onClick={() => navigate("/ohomepage")}>
        ← Dashboard
      </button>

      <h1>Registrierungen Verwalten</h1>
      <p>Alle Anmeldungen für SMP</p>

      {error && (
        <div style={{ marginBottom: 12, color: "red" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="approve-all-btn" onClick={handleApproveAll}>
          Alle ausstehenden Anmeldungen genehmigen
        </button>
      </div>

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