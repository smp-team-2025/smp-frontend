import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { DiplomaIssued } from "../api/diplomas";
import { diplomasApi } from "../api/diplomas";
import "./diplomas.css";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function getParticipantIdFromToken(): number | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    // base64url -> base64
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(json);

    // Common possibilities
    const id = payload.userId ?? payload.id ?? payload.sub ?? null;
    const num = typeof id === "string" ? parseInt(id, 10) : id;

    return Number.isFinite(num) ? num : null;
  } catch {
    return null;
  }
}

export default function DiplomaDownloadPage() {
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [items, setItems] = useState<DiplomaIssued[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const refresh = async (pid: number) => {
    try {
      setLoading(true);
      setError("");
      const data = await diplomasApi.listByParticipant(pid);
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load diplomas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pid = getParticipantIdFromToken();
    setParticipantId(pid);

    if (!pid) {
      setLoading(false);
      setError("Could not determine participant id from token. Please login again.");
      return;
    }

    refresh(pid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = a.issuedAt ? new Date(a.issuedAt).getTime() : 0;
      const tb = b.issuedAt ? new Date(b.issuedAt).getTime() : 0;
      return tb - ta;
    });
  }, [items]);

  const latest = useMemo(() => (sortedItems.length ? sortedItems[0] : null), [sortedItems]);

  const download = async (eventId: number) => {
    if (!participantId) {
      alert("Missing participant id. Please login again.");
      return;
    }

    try {
      const blob = await diplomasApi.downloadPdf(participantId, eventId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diploma-${participantId}-${eventId}.pdf`;
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
          <Link to="/studenthomepage" className="back-btn">
            ← Dashboard
          </Link>
          <Link to="/login" className="logout-btn">
            Logout
          </Link>
        </div>
      </header>

      <main className="container">
        <div className="diplomas-header">
          <div>
            <h1>My Diploma</h1>
            <p className="subtitle">Download your SMP participation diploma</p>
          </div>

          <div className="diplomas-tools">
            <button
              className="secondary-btn"
              onClick={() => participantId && refresh(participantId)}
              disabled={loading || !participantId}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && <p>Loading…</p>}

        {!loading && error && (
          <div className="empty-state">
            <h2>Could not load diplomas</h2>
            <p className="muted">{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="empty-state">
            <h2>No diploma available yet</h2>
            <p className="muted">Organizer diplomas ürettiğinde burada görünecek.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="cards" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            <div className="card" style={{ cursor: "default" }}>
              <h2>Latest diploma</h2>
              <p>
                Issued: <strong>{formatDate(latest?.issuedAt)}</strong>
                <br />
                <span className="muted">
                  Event: {latest?.event.title} (#{latest?.event.id})
                </span>
                <br />
                <span className="muted">Certificate: {latest?.certificateNumber}</span>
              </p>

              <div className="card-actions">
                <button className="primary-btn" onClick={() => latest && download(latest.event.id)}>
                  Download
                </button>
              </div>
            </div>

            <div className="card" style={{ cursor: "default" }}>
              <h2>All diplomas</h2>
              <p className="muted">Birden fazla oturuma katıldıysan birden fazla diploma görebilirsin.</p>

              <div className="mini-list">
                {sortedItems.map((d) => (
                  <div key={`${d.participant.id}-${d.event.id}-${d.certificateNumber}`} className="mini-row">
                    <div>
                      <div className="mini-title">{d.event.title}</div>
                      <div className="muted">
                        Issued: {formatDate(d.issuedAt)} • Certificate: {d.certificateNumber}
                      </div>
                    </div>

                    <button className="secondary-btn" onClick={() => download(d.event.id)}>
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
