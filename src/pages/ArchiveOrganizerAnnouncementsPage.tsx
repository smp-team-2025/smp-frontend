import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./organizerannouncements.css";

interface Attachment {
    id: number;
    url: string;
    mimeType: string;
}

type Visibility = "ORGA_ONLY" | "HIWI_ORGA" | "PUBLIC";

type Announcement = {
    id: number;
    title: string | null;
    body: string;
    createdAt: string;
    eventId?: number | null;
    visibility?: Visibility | null;
    author?: {
        name?: string;
        role?: string;
    } | null;
    attachments?: Attachment[];
};

function resolveAssetUrl(rawUrl: string | undefined | null) {
    if (!rawUrl) return "";
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

    const backendOrigin =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN?.toString()?.trim() || "";

    const base = backendOrigin || window.location.origin;

    try {
        return new URL(rawUrl, base).toString();
    } catch {
        return rawUrl;
    }
}

/**
 * Parse [color=...]...[/color] tags and also keep line breaks (\n -> <br/>)
 * Supported:
 *   [color=red]text[/color]
 *   [color=#ff00aa]text[/color]
 *   nested colors are supported
 */
function renderColoredText(input: string): ReactNode {
    if (!input) return null;

    const tokenRegex = /\[color=([^\]]+)\]|\[\/color\]/g;

    type StyleFrame = { color: string };
    const stack: StyleFrame[] = [];

    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    function pushTextChunk(text: string) {
        if (!text) return;

        const parts = text.split("\n");
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part) {
                const color = stack.length ? stack[stack.length - 1].color : undefined;
                nodes.push(
                    color ? (
                        <span key={`t-${key++}`} style={{ color }}>
                            {part}
                        </span>
                    ) : (
                        <span key={`t-${key++}`}>{part}</span>
                    )
                );
            }
            if (i < parts.length - 1) nodes.push(<br key={`br-${key++}`} />);
        }
    }

    let match: RegExpExecArray | null;
    while ((match = tokenRegex.exec(input)) !== null) {
        pushTextChunk(input.slice(lastIndex, match.index));

        const full = match[0];
        if (full.startsWith("[color=")) {
            const rawColor = match[1]?.trim() || "";
            const ok =
                /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawColor) ||
                /^[a-zA-Z]+$/.test(rawColor);
            if (ok) stack.push({ color: rawColor });
        } else if (full === "[/color]") {
            if (stack.length) stack.pop();
        }

        lastIndex = tokenRegex.lastIndex;
    }

    pushTextChunk(input.slice(lastIndex));
    return nodes;
}

export default function ArchiveOrganizerAnnouncementsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [eventTitle, setEventTitle] = useState<string>("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    const eventIdParam = searchParams.get("eventId");
    const eventId = Number(eventIdParam);

    useEffect(() => {
        // auth
        if (!checkAuthAndRedirect(navigate)) return;

        if (!eventIdParam || Number.isNaN(eventId)) {
            setError("Ungültige Event-ID.");
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const headers: HeadersInit = { Authorization: `Bearer ${token}` };

        (async () => {
            try {
                setLoading(true);
                setError("");

                // event title (optional)
                try {
                    const evRes = await fetch("/api/events", { headers });
                    if (evRes.ok) {
                        const evs = await evRes.json();
                        const found = Array.isArray(evs)
                            ? evs.find((e: any) => Number(e.id) === eventId)
                            : null;
                        setEventTitle(found?.title ?? "");
                    }
                } catch {
                    // title is optional; ignore
                }

                // announcements for specific event
                const res = await fetch(`/api/announcements?eventId=${eventId}`, { headers });
                if (!res.ok) {
                    const t = await res.text().catch(() => "");
                    throw new Error(`Failed to load announcements (${res.status}): ${t}`);
                }

                const data = await res.json();
                setAnnouncements(Array.isArray(data) ? data : []);
            } catch (e: any) {
                setError(e?.message || "Failed to load announcements");
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate, eventIdParam, eventId]);

    const postList = useMemo(() => announcements ?? [], [announcements]);

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <div className="nav-left">
                    <span className="logo">SMP 2026</span>
                </div>
                <div className="nav-right">
                    <Link to="/archive" className="back-btn">
                        ← Archiv
                    </Link>
                    <Link to="/ohomepage" className="back-btn">
                        ← Dashboard
                    </Link>
                    <Link to="/login" className="logout-btn">
                        Logout
                    </Link>
                </div>
            </header>

            <main className="announcements-container">
                <h1>Ankündigungen (Archiv)</h1>
                <p style={{ marginTop: 6, color: "#666" }}>
                    Event:{" "}
                    <strong>{eventTitle ? eventTitle : `#${Number.isNaN(eventId) ? "—" : eventId}`}</strong>
                </p>

                {loading && <p style={{ marginTop: 20 }}>Lädt…</p>}
                {error && <p className="error-message">{error}</p>}

                {!loading && !error && (
                    <div className="announcements-list">
                        {postList.length === 0 && <p>Keine Ankündigungen gefunden.</p>}

                        {postList.map((post) => {
                            const firstAttachment = post.attachments?.[0];
                            const imgSrc = resolveAssetUrl(firstAttachment?.url);

                            return (
                                <div key={post.id} className="announcement-card">
                                    <div className="post-header">
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                <h2 className="post-title" style={{ margin: 0 }}>
                                                    {post.title || "Ohne Titel"}
                                                </h2>

                                                {post.visibility && (
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            padding: "4px 10px",
                                                            borderRadius: 999,
                                                            background: "rgba(0,0,0,0.06)",
                                                            color: "#333",
                                                            fontWeight: 600,
                                                        }}
                                                        title="Visibility"
                                                    >
                                                        {post.visibility}
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ fontSize: 13, color: "#666" }}>
                                                von <strong>{post.author?.name ?? "Unbekannt"}</strong>
                                                {post.author?.role ? (
                                                    <span style={{ marginLeft: 8, opacity: 0.85 }}>
                                                        ({post.author.role})
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="post-meta">
                                            <span className="post-date">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="post-body" style={{ whiteSpace: "normal" }}>
                                        {renderColoredText(post.body)}
                                    </div>

                                    {!!imgSrc && (
                                        <div className="post-attachment">
                                            <img
                                                src={imgSrc}
                                                alt="Attachment"
                                                className="attachment-img"
                                                style={{
                                                    display: "block",
                                                    maxWidth: "100%",
                                                    height: "auto",
                                                    borderRadius: 12,
                                                    marginTop: 10,
                                                }}
                                                onError={() => console.error("Image failed to load:", imgSrc)}
                                            />
                                        </div>
                                    )}

                                    {/* Read-only: no comments, no edit/delete */}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}