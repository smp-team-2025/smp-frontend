import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import { getActiveEvent } from "../api/event";

type EventDiplomaSettings = {
  id: number;
  title: string;
  diplomaSigner1Name?: string | null;
  diplomaSigner1Role?: string | null;
  diplomaSigner1SignatureUrl?: string | null;
  diplomaSigner2Name?: string | null;
  diplomaSigner2Role?: string | null;
  diplomaSigner2SignatureUrl?: string | null;
  diplomaLocation?: string | null;
};

export default function DiplomaSettingsPage() {
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);
  const headers: HeadersInit = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const [event, setEvent] = useState<EventDiplomaSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // form fields
  const [signer1Name, setSigner1Name] = useState("");
  const [signer1Role, setSigner1Role] = useState("");
  const [signer2Name, setSigner2Name] = useState("");
  const [signer2Role, setSigner2Role] = useState("");
  const [location, setLocation] = useState("Darmstadt");

  const [sig1File, setSig1File] = useState<File | null>(null);
  const [sig2File, setSig2File] = useState<File | null>(null);

  useEffect(() => {
    const ok = checkAuthAndRedirect(navigate);
    if (!ok) return;

    const role = localStorage.getItem("role");
    if (role !== "ORGANIZER") {
      navigate("/login", { replace: true });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setOkMsg(null);

        if (!token) {
          setError("Nicht eingeloggt.");
          return;
        }

        const active = await getActiveEvent(headers);

        const res = await fetch(`/api/events/${active.id}`, { headers });
        if (!res.ok) throw new Error("Eventdaten konnten nicht geladen werden.");

        const data: EventDiplomaSettings = await res.json();
        setEvent(data);

        setSigner1Name(data.diplomaSigner1Name ?? "");
        setSigner1Role(data.diplomaSigner1Role ?? "");
        setSigner2Name(data.diplomaSigner2Name ?? "");
        setSigner2Role(data.diplomaSigner2Role ?? "");
        setLocation(data.diplomaLocation ?? "Darmstadt");
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden der Einstellungen.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveTextSettings() {
    if (!event) return;
    setSaving(true);
    setError(null);
    setOkMsg(null);

    try {
      const res = await fetch(`/api/events/${event.id}/diploma-settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          diplomaSigner1Name: signer1Name || null,
          diplomaSigner1Role: signer1Role || null,
          diplomaSigner2Name: signer2Name || null,
          diplomaSigner2Role: signer2Role || null,
          diplomaLocation: location || "Darmstadt",
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Speichern fehlgeschlagen.");
      }

      setOkMsg("Einstellungen gespeichert.");
    } catch (e: any) {
      setError(e?.message ?? "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadSignatures() {
    if (!event) return;

    if (!sig1File && !sig2File) {
      setError("Bitte mindestens eine Signatur-Datei auswählen.");
      return;
    }

    setUploading(true);
    setError(null);
    setOkMsg(null);

    try {
      const fd = new FormData();
      if (sig1File) fd.append("signer1Signature", sig1File);
      if (sig2File) fd.append("signer2Signature", sig2File);

      const res = await fetch(`/api/events/${event.id}/diploma-signatures`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Upload fehlgeschlagen.");
      }

      const updated = await res.json();
      setEvent((prev) => (prev ? { ...prev, ...updated } : prev));
      setSig1File(null);
      setSig2File(null);
      setOkMsg("Signaturen hochgeladen.");
    } catch (e: any) {
      setError(e?.message ?? "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <span className="logo">SMP 2026</span>
        <div className="nav-right">
          <Link to="/ohomepage/diplomas" className="back-btn">← Zurück zu Diplomen</Link>
          <Link to="/ohomepage" className="back-btn">← Dashboard</Link>
          <Link to="/login" className="logout-btn">Logout</Link>
        </div>
      </header>

      <main className="container">
        <h1>Diplom-Einstellungen</h1>

        {loading ? (
          <p style={{ marginTop: 20 }}>Lädt…</p>
        ) : error ? (
          <div style={{ background: "#ffe5e5", padding: 12, borderRadius: 8, color: "#b00020" }}>
            {error}
          </div>
        ) : !event ? (
          <p>Kein aktives Event gefunden.</p>
        ) : (
          <>
            <p>
              Aktives Event: <strong>{event.title}</strong>
            </p>

            {okMsg && (
              <div style={{ background: "#e7ffe7", padding: 12, borderRadius: 8, color: "#126b12" }}>
                {okMsg}
              </div>
            )}

            <div style={{ marginTop: 18, display: "grid", gap: 12, maxWidth: 820 }}>
              <h2 style={{ margin: 0 }}>Texte</h2>

              <label style={{ fontWeight: 600 }}>Ort</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} />

              <label style={{ fontWeight: 600 }}>Unterzeichner:in 1 – Name</label>
              <input value={signer1Name} onChange={(e) => setSigner1Name(e.target.value)} />

              <label style={{ fontWeight: 600 }}>Unterzeichner:in 1 – Titel / Rolle</label>
              <input value={signer1Role} onChange={(e) => setSigner1Role(e.target.value)} />

              <label style={{ fontWeight: 600 }}>Unterzeichner:in 2 – Name</label>
              <input value={signer2Name} onChange={(e) => setSigner2Name(e.target.value)} />

              <label style={{ fontWeight: 600 }}>Unterzeichner:in 2 – Titel / Rolle</label>
              <input value={signer2Role} onChange={(e) => setSigner2Role(e.target.value)} />

              <button
                onClick={saveTextSettings}
                disabled={saving}
                style={{
                  marginTop: 10,
                  height: 44,
                  borderRadius: 8,
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  width: 240,
                }}
              >
                {saving ? "Speichert…" : "Speichern"}
              </button>
            </div>

            <hr style={{ margin: "26px 0" }} />

            <div style={{ display: "grid", gap: 12, maxWidth: 820 }}>
              <h2 style={{ margin: 0 }}>Signaturen</h2>

              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Signatur 1</div>
                  {event.diplomaSigner1SignatureUrl ? (
                    <img
                      src={event.diplomaSigner1SignatureUrl}
                      alt="Signatur 1"
                      style={{ maxHeight: 70, border: "1px solid #ddd", borderRadius: 6, padding: 6 }}
                    />
                  ) : (
                    <div style={{ color: "#666" }}>Keine Signatur hinterlegt.</div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setSig1File(e.target.files?.[0] ?? null)}
                  />
                </div>

                <div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Signatur 2</div>
                  {event.diplomaSigner2SignatureUrl ? (
                    <img
                      src={event.diplomaSigner2SignatureUrl}
                      alt="Signatur 2"
                      style={{ maxHeight: 70, border: "1px solid #ddd", borderRadius: 6, padding: 6 }}
                    />
                  ) : (
                    <div style={{ color: "#666" }}>Keine Signatur hinterlegt.</div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setSig2File(e.target.files?.[0] ?? null)}
                  />
                </div>

                <button
                  onClick={uploadSignatures}
                  disabled={uploading}
                  style={{
                    height: 44,
                    borderRadius: 8,
                    border: "none",
                    background: "#111",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                    width: 260,
                  }}
                >
                  {uploading ? "Lädt hoch…" : "Signaturen hochladen"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}