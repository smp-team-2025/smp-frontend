import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import { getActiveEvent, getEventById, updateApprovalEmailSettings } from "../api/event";

type EventApprovalEmailSettings = {
  id: number;
  title: string;
  approvalEmailSubject?: string | null;
  approvalEmailIntro?: string | null;
};

export default function ApprovalEmailSettingsPage() {
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);
  const headers: HeadersInit = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const [event, setEvent] = useState<EventApprovalEmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [subject, setSubject] = useState<string>("");
  const [intro, setIntro] = useState<string>("");

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
        const data = await getEventById(active.id, headers);

        setEvent(data);
        setSubject(data.approvalEmailSubject ?? "");
        setIntro(data.approvalEmailIntro ?? "");
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden der Einstellungen.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    if (!event) return;

    setSaving(true);
    setError(null);
    setOkMsg(null);

    try {
      await updateApprovalEmailSettings(event.id, headers, {
        approvalEmailSubject: subject.trim() ? subject.trim() : null,
        approvalEmailIntro: intro.trim() ? intro : null,
      });
      setOkMsg("Einstellungen gespeichert.");
    } catch (e: any) {
      setError(e?.message ?? "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>Approval E-Mail Text</h1>
        <Link to="/ohomepage" style={{ textDecoration: "none" }}>
          ← Zurück
        </Link>
      </div>

      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Diese Einstellungen gelten für das aktive Event und werden beim Genehmigen einer Registrierung
        als Intro an den Anfang der Approval-Mail gesetzt.
      </p>

      {loading ? (
        <p>Lädt…</p>
      ) : error ? (
        <p style={{ color: "crimson" }}>{error}</p>
      ) : !event ? (
        <p>Kein aktives Event gefunden.</p>
      ) : (
        <>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              padding: 16,
              marginTop: 16,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Subject</div>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="z.B. SMP 2026 – Registration approved"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "inherit",
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Intro / Instructions (kommt ganz oben)
              </div>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="AG instructions..."
                rows={8}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.08)",
                color: "inherit",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Speichert…" : "Speichern"}
            </button>

            {okMsg && <p style={{ color: "lightgreen", marginTop: 10 }}>{okMsg}</p>}
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Vorschau (plain text):</div>
            <div
              style={{
                border: "1px dashed rgba(0,0,0,0.2)",
                borderRadius: 12,
                padding: 16,
                whiteSpace: "pre-wrap",
                background: "rgba(0,0,0,0.03)",
                color: "inherit",
              }}
            >
              {intro || "(leer)"}
              {"\n\n"}Hello &lt;Name&gt;,
              {"\n"}Your registration for SMP has been approved.
              {"\n\n"}Credentials:
              {"\n"}- Email: &lt;Email&gt;
              {"\n"}- Password: &lt;Password&gt;
            </div>
          </div>
        </>
      )}
    </div>
  );
}