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
    const root = document.getElementById("root");

    const previousBodyDisplay = document.body.style.display;
    const previousBodyPlaceItems = (document.body.style as any).placeItems;
    const previousBodyMinHeight = document.body.style.minHeight;
    const previousBodyBackground = document.body.style.background;
    const previousBodyColor = document.body.style.color;
    const previousBodyMargin = document.body.style.margin;
    const previousBodyWidth = document.body.style.width;

    const previousRootMaxWidth = root?.style.maxWidth ?? "";
    const previousRootMargin = root?.style.margin ?? "";
    const previousRootPadding = root?.style.padding ?? "";
    const previousRootTextAlign = root?.style.textAlign ?? "";
    const previousRootWidth = root?.style.width ?? "";
    const previousRootMinHeight = root?.style.minHeight ?? "";

    document.body.style.display = "block";
    (document.body.style as any).placeItems = "unset";
    document.body.style.minHeight = "auto";
    document.body.style.background = "#f6f9fc";
    document.body.style.color = "#1f2937";
    document.body.style.margin = "0";
    document.body.style.width = "100%";

    if (root) {
      root.style.maxWidth = "none";
      root.style.margin = "0";
      root.style.padding = "0";
      root.style.textAlign = "left";
      root.style.width = "100%";
      root.style.minHeight = "100vh";
    }

    return () => {
      document.body.style.display = previousBodyDisplay;
      (document.body.style as any).placeItems = previousBodyPlaceItems;
      document.body.style.minHeight = previousBodyMinHeight;
      document.body.style.background = previousBodyBackground;
      document.body.style.color = previousBodyColor;
      document.body.style.margin = previousBodyMargin;
      document.body.style.width = previousBodyWidth;

      if (root) {
        root.style.maxWidth = previousRootMaxWidth;
        root.style.margin = previousRootMargin;
        root.style.padding = previousRootPadding;
        root.style.textAlign = previousRootTextAlign;
        root.style.width = previousRootWidth;
        root.style.minHeight = previousRootMinHeight;
      }
    };
  }, []);

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
  }, [headers, token]);

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
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#f6f9fc",
        padding: "32px 0",
        color: "#1f2937",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
          padding: "0 24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 8,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 48,
              lineHeight: 1.1,
              color: "#1f2937",
            }}
          >
            Approval E-Mail Text
          </h1>

          <Link to="/ohomepage" style={{ textDecoration: "none" }}>
            ← Zurück
          </Link>
        </div>

        <p
          style={{
            marginTop: 8,
            marginBottom: 24,
            opacity: 0.8,
            color: "#374151",
          }}
        >
          Diese Einstellungen gelten für das aktive Event und werden beim
          Genehmigen einer Registrierung als Intro an den Anfang der
          Approval-Mail gesetzt.
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
                border: "1px solid #d1d5db",
                borderRadius: 12,
                padding: 16,
                marginTop: 16,
                background: "#ffffff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
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
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#1f2937",
                    boxSizing: "border-box",
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
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#1f2937",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <button
                onClick={save}
                disabled={saving}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#1f2937",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Speichert…" : "Speichern"}
              </button>

              {okMsg && (
                <p style={{ color: "green", marginTop: 10 }}>{okMsg}</p>
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                Vorschau (plain text):
              </div>
              <div
                style={{
                  border: "1px dashed #cbd5e1",
                  borderRadius: 12,
                  padding: 16,
                  whiteSpace: "pre-wrap",
                  background: "#ffffff",
                  color: "#1f2937",
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
    </div>
  );
}