import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  announcementsApi,
  type Announcement,
  type AnnouncementComment,
} from "../api/announcements";
import "./organizerannouncements.css";

interface Attachment {
  id: number;
  url: string;
  mimeType: string;
}

interface AnnouncementWithAttachments extends Announcement {
  attachments?: Attachment[];
  comments?: AnnouncementComment[];
  showComments?: boolean;
}

type Visibility = "ORGA_ONLY" | "HIWI_ORGA" | "PUBLIC";

type ActiveEventDto = {
  id: number;
  title: string;
  isActive: boolean;
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

export default function HiwiAnnouncements() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeEvent, setActiveEvent] = useState<ActiveEventDto | null>(null);

  const [announcements, setAnnouncements] = useState<AnnouncementWithAttachments[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("HIWI_ORGA");
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [editingComment, setEditingComment] = useState<{ id: number; body: string } | null>(null);

  const [pickedColor, setPickedColor] = useState<string>("#1d4ed8");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function init() {
    try {
      setError("");

      const evRes = await fetch("/api/events/active", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!evRes.ok) {
        const txt = await evRes.text().catch(() => "");
        throw new Error(`Aktives Event konnte nicht geladen werden (${evRes.status}) ${txt}`);
      }
      const ev = (await evRes.json()) as ActiveEventDto;
      setActiveEvent(ev);

      await loadAnnouncements(ev.id);
    } catch (e: any) {
      setError(e?.message || "Init failed");
    }
  }

  async function loadAnnouncements(eventId: number) {
    try {
      setError("");
      const res = await fetch(`/api/announcements?eventId=${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to load announcements (${res.status}) ${txt}`);
      }
      const data = (await res.json()) as AnnouncementWithAttachments[];
      setAnnouncements(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load announcements");
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyColorToSelection = () => {
    const el = contentRef.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    if (start === end) {
      const insert = `[color=${pickedColor}][/color]`;
      const newValue = content.slice(0, start) + insert + content.slice(end);
      setContent(newValue);

      requestAnimationFrame(() => {
        el.focus();
        const cursorPos = start + `[color=${pickedColor}]`.length;
        el.setSelectionRange(cursorPos, cursorPos);
      });
      return;
    }

    const selected = content.slice(start, end);
    const wrapped = `[color=${pickedColor}]${selected}[/color]`;
    const newValue = content.slice(0, start) + wrapped + content.slice(end);
    setContent(newValue);

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, start + wrapped.length);
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!activeEvent?.id) {
      setError("Kein aktives Event gefunden.");
      return;
    }

    try {
      setError("");

      const newPost = await announcementsApi.create({
        title: title.trim() || undefined,
        body: content,
        eventId: activeEvent.id,
        visibility,
      });

      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);

        const uploadRes = await fetch(`/api/announcements/${newPost.id}/attachments`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!uploadRes.ok) {
          const text = await uploadRes.text().catch(() => "");
          console.error("Failed to upload image:", uploadRes.status, text);
        }
      }

      await loadAnnouncements(activeEvent.id);
      setTitle("");
      setContent("");
      clearImage();
    } catch (err: any) {
      setError(err?.message || "Failed to post announcement");
    }
  };

  const toggleComments = async (announcementId: number) => {
    setAnnouncements((prev) =>
      prev.map((p) => (p.id === announcementId ? { ...p, showComments: !p.showComments } : p))
    );

    const current = announcements.find((a) => a.id === announcementId);
    const willShow = !(current?.showComments ?? false);

    if (willShow && !current?.comments) {
      try {
        const comments = await announcementsApi.getComments(announcementId);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === announcementId ? { ...a, comments } : a))
        );
      } catch (err) {
        console.error("Failed to load comments", err);
      }
    }
  };

  const handleCommentInputChange = (announcementId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [announcementId]: value }));
  };

  const submitComment = async (announcementId: number) => {
    const body = commentInputs[announcementId];
    if (!body?.trim()) return;

    try {
      const newComment = await announcementsApi.createComment(announcementId, body);
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcementId ? { ...a, comments: [...(a.comments || []), newComment] } : a
        )
      );
      setCommentInputs((prev) => ({ ...prev, [announcementId]: "" }));
    } catch {
      alert("Failed to add comment");
    }
  };

  const saveEditComment = async () => {
    if (!editingComment) return;
    try {
      const updated = await announcementsApi.updateComment(editingComment.id, editingComment.body);
      setAnnouncements((prev) =>
        prev.map((post) => {
          if (!post.comments?.some((c) => c.id === editingComment.id)) return post;
          return {
            ...post,
            comments: post.comments.map((c) => (c.id === editingComment.id ? updated : c)),
          };
        })
      );
      setEditingComment(null);
    } catch {
      alert("Failed to update comment");
    }
  };

  const postList = useMemo(() => announcements ?? [], [announcements]);

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <div className="nav-left">
          <span className="logo">SMP 2026</span>
        </div>
        <div className="nav-right">
          <Link to="/hiwihomepage" className="back-btn">
            ← Dashboard
          </Link>
          <Link to="/login" className="logout-btn">
            Logout
          </Link>
        </div>
      </header>

      <main className="announcements-container">
        <h1>Announcements</h1>

        {activeEvent && (
          <div style={{ marginBottom: 12, color: "#666" }}>
            Aktives Event: <b>{activeEvent.title}</b>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        <div className="announcement-card create-post-card">
          <h2 className="section-title">Create New Post</h2>

          <form onSubmit={handleCreate} className="post-form">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="form-control"
            >
              <option value="HIWI_ORGA">HIWI_ORGA (HiWis + Organizers)</option>
              <option value="PUBLIC">PUBLIC (Everyone)</option>
            </select>

            <input
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
            />

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#444" }}>Text color</span>
                <input
                  type="color"
                  value={pickedColor}
                  onChange={(e) => setPickedColor(e.target.value)}
                  style={{ width: 42, height: 32, padding: 0, border: "none", background: "transparent" }}
                />
              </label>

              <button
                type="button"
                onClick={applyColorToSelection}
                className="submit-post-btn"
                style={{ padding: "10px 14px" }}
              >
                Apply to selection
              </button>
            </div>

            <textarea
              ref={contentRef}
              placeholder="Write your announcement here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="form-control"
            />

            <div className="image-section">
              <div className="file-input-wrapper">
                <label htmlFor="image-upload" className="add-image-btn">
                  📷 Add Image
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  ref={fileInputRef}
                />
                {selectedImage && <span className="file-name">{selectedImage.name}</span>}
              </div>

              {previewUrl && (
                <div className="preview-wrapper">
                  <img src={previewUrl} alt="Preview" className="preview-img" />
                  <button type="button" onClick={clearImage} className="clear-btn"></button>
                </div>
              )}
            </div>

            <button type="submit" className="submit-post-btn" disabled={!activeEvent?.id}>
              Post Announcement
            </button>
          </form>
        </div>

        <div className="announcements-list">
          {postList.length === 0 && <p>No announcements found.</p>}

          {postList.map((post) => {
            const firstAttachment = post.attachments?.[0];
            const imgSrc = resolveAssetUrl(firstAttachment?.url);

            return (
              <div key={post.id} className="announcement-card">
                <div className="post-header">
                  <h2 className="post-title">{post.title || "Untitled"}</h2>
                  <div className="post-meta">
                    <span className="post-date">{new Date(post.createdAt).toLocaleDateString("de-DE")}</span>
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
                      style={{ display: "block", maxWidth: "100%", height: "auto", borderRadius: 12, marginTop: 10 }}
                    />
                  </div>
                )}

                <div className="comments-section">
                  <button onClick={() => toggleComments(post.id)} className="toggle-comments-btn">
                    {post.showComments ? "Hide Comments" : "Show Comments"}
                  </button>

                  {post.showComments && (
                    <div className="comments-list">
                      {post.comments?.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-meta">
                            <span>{comment.author.name}</span>
                            <span>{new Date(comment.createdAt).toLocaleDateString("de-DE")}</span>
                          </div>

                          {editingComment?.id === comment.id ? (
                            <div className="edit-comment-form">
                              <input
                                value={editingComment.body}
                                onChange={(e) => setEditingComment({ ...editingComment, body: e.target.value })}
                                className="edit-comment-input"
                              />
                              <button onClick={saveEditComment} className="comment-action-btn">
                                Save
                              </button>
                              <button onClick={() => setEditingComment(null)} className="comment-action-btn">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="comment-content">
                              <p className="comment-text">{comment.body}</p>
                              <div className="comment-actions">
                                <button
                                  onClick={() => setEditingComment({ id: comment.id, body: comment.body })}
                                  className="icon-btn edit"
                                  title="Edit"
                                >
                                  ✎
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="add-comment-form">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                          className="add-comment-input"
                        />
                        <button onClick={() => submitComment(post.id)} className="post-comment-btn">
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}