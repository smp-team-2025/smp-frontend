import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./hiwilist.css";
import "./admin.css";

interface Session {
  id: number;
  title: string;
}

interface HiWi {
  id: number; // hiwiId
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Create form state
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createEmail2, setCreateEmail2] = useState("");
  const [createClothingSize, setCreateClothingSize] = useState("");
  const [creating, setCreating] = useState(false);

  // ✅ Inline edit state
  const [editingHiwiId, setEditingHiwiId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editClothingSize, setEditClothingSize] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  function getTokenOrRedirect(): string | null {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  }

  const fetchData = async () => {
    try {
      const token = getTokenOrRedirect();
      if (!token) return;

      const [hiwiRes, sessionRes] = await Promise.all([
        fetch("/api/hiwis", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/events/1/sessions", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (hiwiRes.ok) {
        const data = await hiwiRes.json();
        setHiwis(data);
      } else {
        setError("Failed to load HiWis.");
      }

      if (sessionRes.ok) {
        const data = await sessionRes.json();
        setSessions(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // CREATE HIWI
  // -----------------------
  const handleCreateHiwi = async () => {
    if (!createName.trim() || !createEmail.trim()) {
      alert("Bitte Name und E-Mail ausfüllen.");
      return;
    }
    if (createEmail.trim().toLowerCase() !== createEmail2.trim().toLowerCase()) {
      alert("E-Mail und Bestätigung stimmen nicht überein.");
      return;
    }

    const ok = window.confirm("Sind Sie sicher, dass Sie den HiWi erstellen möchten?");
    if (!ok) return;

    try {
      setCreating(true);

      const token = getTokenOrRedirect();
      if (!token) return;

      const res = await fetch("/api/hiwis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: createEmail.trim().toLowerCase(),
          name: createName.trim(),
          clothingSize: createClothingSize.trim() ? createClothingSize.trim() : null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || `Create failed (${res.status})`);
        return;
      }

      alert("Das Passwort wurde an die E-Mail des HiWi gesendet.");

      await fetchData();

      // reset
      setCreateName("");
      setCreateEmail("");
      setCreateEmail2("");
      setCreateClothingSize("");
    } catch (e: any) {
      alert(e?.message ?? "Fehler beim Erstellen");
    } finally {
      setCreating(false);
    }
  };

  // -----------------------
  // EDIT HIWI
  // -----------------------
  const startEdit = (h: HiWi) => {
    setEditingHiwiId(h.id);
    setEditName(h.user.name || "");
    setEditClothingSize(h.clothingSize || "");
  };

  const cancelEdit = () => {
    setEditingHiwiId(null);
    setEditName("");
    setEditClothingSize("");
  };

  const saveEdit = async (hiwiId: number) => {
    try {
      setSavingEdit(true);

      const token = getTokenOrRedirect();
      if (!token) return;

      const res = await fetch(`/api/hiwis/${hiwiId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim() ? editName.trim() : null,
          clothingSize: editClothingSize.trim() ? editClothingSize.trim() : null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || `Update failed (${res.status})`);
        return;
      }


      await fetchData();
      cancelEdit();
    } catch (e: any) {
      alert(e?.message ?? "Update failed");
    } finally {
      setSavingEdit(false);
    }
  };

  // -----------------------
  // DELETE HIWI
  // -----------------------
  const handleDeleteHiwi = async (hiwiId: number) => {
    const ok = window.confirm("HiWi wirklich löschen? (User wird auch gelöscht)");
    if (!ok) return;

    try {
      const token = getTokenOrRedirect();
      if (!token) return;

      const res = await fetch(`/api/hiwis/${hiwiId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || `Delete failed (${res.status})`);
        return;
      }

      setHiwis((prev) => prev.filter((h) => h.id !== hiwiId));
      if (editingHiwiId === hiwiId) cancelEdit();
    } catch (e: any) {
      alert(e?.message ?? "Delete failed");
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

        {/* CREATE BOX */}
        <div style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 18 }}>
          <h2 style={{ marginTop: 0 }}>Neuen HiWi anlegen</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Name*"
              style={{ padding: 10 }}
            />
            <input
              value={createClothingSize}
              onChange={(e) => setCreateClothingSize(e.target.value)}
              placeholder="Clothing Size (optional)"
              style={{ padding: 10 }}
            />
            <input
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="E-Mail*"
              style={{ padding: 10 }}
            />
            <input
              value={createEmail2}
              onChange={(e) => setCreateEmail2(e.target.value)}
              placeholder="E-Mail bestätigen*"
              style={{ padding: 10 }}
            />
          </div>

          <button
            onClick={handleCreateHiwi}
            disabled={creating}
            style={{ marginTop: 12, padding: "10px 14px", cursor: creating ? "not-allowed" : "pointer" }}
          >
            {creating ? "Erstellt..." : "HiWi erstellen"}
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Clothing Size</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {hiwis.map((hiwi) => {
                const isEditing = editingHiwiId === hiwi.id;

                return (
                  <tr key={hiwi.id}>
                    <td>
                      {isEditing ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ padding: 6, width: "100%" }}
                        />
                      ) : (
                        hiwi.user.name
                      )}
                    </td>

                    <td>{hiwi.user.email}</td>

                    <td>
                      {isEditing ? (
                        <input
                          value={editClothingSize}
                          onChange={(e) => setEditClothingSize(e.target.value)}
                          style={{ padding: 6, width: "100%" }}
                          placeholder="e.g. S/M/L"
                        />
                      ) : (
                        hiwi.clothingSize || "-"
                      )}
                    </td>

                    

                    {/* Actions */}
                    <td>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => saveEdit(hiwi.id)}
                            disabled={savingEdit}
                            style={{ padding: "6px 10px" }}
                          >
                            {savingEdit ? "Saving..." : "Save"}
                          </button>
                          <button onClick={cancelEdit} style={{ padding: "6px 10px" }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => startEdit(hiwi)} style={{ padding: "6px 10px" }}>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteHiwi(hiwi.id)}
                            style={{ padding: "6px 10px", background: "#dc3545", color: "white", border: "none" }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {hiwis.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
                    No HiWis found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}