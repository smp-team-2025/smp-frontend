import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { diplomasApi } from "../api/diplomas";
import type { DiplomaIssued } from "../api/diplomas";
import "./diplomas.css";

export default function DiplomaListPage() {
  const [eventId, setEventId] = useState<string>("");
  const [items, setItems] = useState<DiplomaIssued[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((d) =>
      `${d.certificateNumber} ${d.participant.name} ${d.participant.email ?? ""} ${d.event.title}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  const loadIssued = async () => {
    const id = Number(eventId);
    if (!id || Number.isNaN(id)) {
      setError("Please enter a valid eventId.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const data = await diplomasApi.listIssuedByEvent(id);
      console.log("Loaded diplomas:", data); // Debug log
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("Error loading diplomas:", e);
      setError(e?.message || "Failed to load issued diplomas.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const download = async (d: DiplomaIssued) => {
    try {
      const blob = await diplomasApi.downloadPdf(d.participant.id, d.event.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diploma-${d.participant.id}-${d.event.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message || "Download failed.");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <span className="logo">SMP 2026</span>
        <div className="nav-right">
          <Link to="/ohomepage" className="back-btn">← Dashboard</Link>
          <Link to="/login" className="logout-btn">Logout</Link>
        </div>
      </header>

      <main className="container">
        <div className="diplomas-header">
          <div>
            <h1>Diplomas</h1>
            <p className="subtitle">Organizer view — list issued diplomas by event</p>
          </div>

          <div className="diplomas-tools">
            <input
              className="search-input"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Event ID (e.g. 1)"
              style={{ minWidth: 220 }}
            />
            <button className="primary-btn" onClick={loadIssued} disabled={loading}>
              {loading ? "Loading..." : "Load"}
            </button>

            {items.length > 0 && (
              <input
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, certificate..."
              />
            )}
          </div>
        </div>

        {error && (
          <div className="error-msg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && !eventId && (
          <div className="empty-state">
            <h2>No diplomas loaded</h2>
            <p className="muted">Enter an Event ID and click Load to see issued diplomas.</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && eventId && (
          <div className="empty-state">
            <h2>No diplomas found for Event #{eventId}</h2>
            <p className="muted">Either no diplomas have been issued yet, or the event doesn't exist.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="table-card">
            <table className="diplomas-table">
              <thead>
                <tr>
                  <th>Certificate</th>
                  <th>Participant</th>
                  <th>Event</th>
                  <th>Issued</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={`${d.participant.id}-${d.event.id}-${d.certificateNumber}`}>
                    <td><strong>{d.certificateNumber}</strong></td>
                    <td>
                      <div className="name-cell">
                        <span className="name">{d.participant.name}</span>
                        {d.participant.email && <span className="muted">{d.participant.email}</span>}
                      </div>
                    </td>
                    <td>{d.event.title} <span className="muted">(#{d.event.id})</span></td>
                    <td>{formatDate(d.issuedAt)}</td>
                    <td>
                      <button className="primary-btn" onClick={() => download(d)}>
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && items.length > 0 && filtered.length === 0 && (
          <div className="empty-state">
            <h2>No matches found</h2>
            <p className="muted">Try a different search query.</p>
          </div>
        )}
      </main>
    </div>
  );
}