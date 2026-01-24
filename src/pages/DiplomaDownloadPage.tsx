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

function safeFileName(value: string) {
  const s = (value || "").trim();

  const mapped = s

   .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .replace(/İ/g, "I")
    .replace(/ı/g, "i");

     const noDiacritics = mapped
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

 return (noDiacritics || "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/[^\w\s-]/g, "")              
    .replace(/\s+/g, "_")                  
    .replace(/_+/g, "_")                   
    .replace(/^_+|_+$/g, "")               
    .trim() || "file";
}

function extractYear(text?: string, fallbackYear?: number) {
  const m = (text || "").match(/\b(19|20)\d{2}\b/);
  if (m?.[0]) return m[0];
  if (fallbackYear) return String(fallbackYear);
  return "Year";
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

    // Bu event'e ait diploma kaydını bul
    const d = items.find((x) => x.event.id === eventId) ?? null;

    const program = "Saturday Morning Physics";
    const year = extractYear(d?.event?.title, d?.issuedAt ? new Date(d.issuedAt).getFullYear() : undefined);
    const studentName = d?.participant?.name ?? "Participant";

    const filename =
      [
        safeFileName(program),
        safeFileName(year),
        safeFileName(studentName),
      ].join("_") + ".pdf";

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
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
  <div className="diploma-cards-grid">
    {/* Latest diploma */}
    <div className="diploma-card diploma-card-featured" style={{ cursor: "default" }}>
      <div className="diploma-card-header">
        <h2>Latest diploma</h2>
        <p className="diploma-card-subtitle">Your most recent participation certificate</p>
      </div>

      <div className="diploma-card-body">
        <div className="diploma-info-row">
          <span className="diploma-label">Issued</span>
          <span className="diploma-value">{formatDate(latest?.issuedAt)}</span>
        </div>

        <div className="diploma-info-row">
          <span className="diploma-label">Event</span>
          <span className="diploma-value">
            {latest?.event.title} (#{latest?.event.id})
          </span>
        </div>

        <div className="diploma-info-row">
          <span className="diploma-label">Certificate</span>
          <span className="diploma-value diploma-cert-number">{latest?.certificateNumber}</span>
        </div>
      </div>

      <div className="diploma-card-footer">
        <button
          className="primary-btn diploma-download-btn"
          onClick={() => latest && download(latest.event.id)}
          disabled={!latest}
        >
          Download
        </button>
      </div>
    </div>

    {/* All diplomas */}
    <div className="diploma-card" style={{ cursor: "default" }}>
      <div className="diploma-card-header">
        <h2>All diplomas</h2>
        <p className="diploma-card-subtitle">
          If you participated in multiple Events, you may see more than one certificate.
        </p>
      </div>

      <div className="diploma-list-container">
        {sortedItems.map((d) => (
          <div key={`${d.participant.id}-${d.event.id}-${d.certificateNumber}`} className="diploma-list-item">
            <div className="diploma-list-info">
              <div className="diploma-list-title">{d.event.title}</div>
              <div className="diploma-list-meta">
                <span className="diploma-list-date">Issued: {formatDate(d.issuedAt)}</span>
                <span className="diploma-list-separator">•</span>
                <span className="diploma-list-cert">Certificate: {d.certificateNumber}</span>
              </div>
            </div>

            <button className="secondary-btn diploma-list-btn" onClick={() => download(d.event.id)}>
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
