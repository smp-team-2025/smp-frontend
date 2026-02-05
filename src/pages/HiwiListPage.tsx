import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveEvent } from "../api/event";
import "./hiwilist.css";
import "./admin.css";

interface Session {
  id: number;
  title: string;
}

interface HiWi {
  id: number;
  clothingSize: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function HiWiListPage() {
  const navigate = useNavigate();
  const [hiwis, setHiwis] = useState<HiWi[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<{ [key: number]: string }>({});
  const [activeEventId, setActiveEventId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // active event
      const ev = await getActiveEvent(headers);
      setActiveEventId(ev.id);

      // hiwis + sessions for active event
      const [hiwiRes, sessionRes] = await Promise.all([
        fetch("/api/hiwis", { headers }),
        fetch(`/api/events/${ev.id}/sessions`, { headers }),
      ]);

      if (!hiwiRes.ok) {
        setError("Failed to load HiWis.");
        setHiwis([]);
      } else {
        setHiwis(await hiwiRes.json());
      }

      if (sessionRes.ok) {
        setSessions(await sessionRes.json());
      } else {
        setError((prev) => prev || "Failed to load sessions.");
        setSessions([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
      setHiwis([]);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (hiwiId: number) => {
    const sessionId = selectedSessions[hiwiId];
    if (!sessionId) {
      alert("Please select a session.");
      return;
    }

    if (!activeEventId) {
      alert("Active event not loaded yet.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`/api/events/${activeEventId}/sessions/${sessionId}/hiwis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hiwiId }),
      });

      if (res.ok) {
        alert("Assigned successfully");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to assign");
      }
    } catch (e) {
      console.error(e);
      alert("Error assigning session");
    }
  };

  return (
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
        <h1>HiWi Management</h1>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Clothing Size</th>
                <th>Assign Session</th>
              </tr>
            </thead>
            <tbody>
              {hiwis.map((hiwi) => (
                <tr key={hiwi.id}>
                  <td>{hiwi.user.name}</td>
                  <td>{hiwi.user.email}</td>
                  <td>{hiwi.clothingSize || "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <select
                        value={selectedSessions[hiwi.id] || ""}
                        onChange={(e) =>
                          setSelectedSessions({ ...selectedSessions, [hiwi.id]: e.target.value })
                        }
                        style={{ padding: "5px" }}
                      >
                        <option value="">Select Session</option>
                        {sessions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(hiwi.id)}
                        style={{ padding: "5px 10px", cursor: "pointer" }}
                      >
                        Assign
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && hiwis.length === 0 && <p>No HiWis found.</p>}
      </main>
    </div>
  );
}