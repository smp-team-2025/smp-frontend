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
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load issued diplomas.");
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
              placeholder="Event ID (e.g. 12)"
              style={{ minWidth: 220 }}
            />
            <button className="primary-btn" onClick={loadIssued} disabled={loading}>
              {loading ? "Loading..." : "Load"}
            </button>

            <input
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, certificate..."
            />
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <h2>No issued diplomas</h2>
            <p className="muted">Enter an Event ID and click Load.</p>
          </div>
        )}

        {!error && filtered.length > 0 && (
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
                    <td>{d.certificateNumber}</td>
                    <td>
                      <div className="name-cell">
                        <span className="name">{d.participant.name}</span>
                        {d.participant.email && <span className="muted">{d.participant.email}</span>}
                      </div>
                    </td>
                    <td>{d.event.title} (#{d.event.id})</td>
                    <td>{new Date(d.issuedAt).toLocaleString()}</td>
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
      </main>
    </div>
  );
}
