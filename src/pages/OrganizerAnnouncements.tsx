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

type EditingPost = {
  id: number;
  eventId: string; // input için string
  visibility: Visibility;
  title: string;
  body: string;
};

/**
 * Backend attachment url is like "/uploads/xxx.jpg".
 * If frontend runs on different origin (e.g. :5173) this will 404 unless you resolve it.
 *
 * Set VITE_BACKEND_ORIGIN in your frontend .env:
 *   VITE_BACKEND_ORIGIN=http://localhost:3000
 */
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
 *
 * Everything else is rendered as plain text (no HTML injection).
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
      if (i < parts.length - 1) {
        nodes.push(<br key={`br-${key++}`} />);
      }
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

function getPostVisibility(post: any): Visibility {
  const v = post?.visibility;
  if (v === "ORGA_ONLY" || v === "HIWI_ORGA" || v === "PUBLIC") return v;
  return "HIWI_ORGA";
}

export default function OrganizerAnnouncements() {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState<AnnouncementWithAttachments[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [eventId, setEventId] = useState<string>("1");
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [editingComment, setEditingComment] = useState<{ id: number; body: string } | null>(null);

  // color feature (create)
  const [pickedColor, setPickedColor] = useState<string>("#1d4ed8");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [visibility, setVisibility] = useState<Visibility>("HIWI_ORGA");

  // Edit Feature
  const [editingPost, setEditingPost] = useState<EditingPost | null>(null);
  const editBodyRef = useRef<HTMLTextAreaElement>(null);
  const [editPickedColor, setEditPickedColor] = useState<string>("#1d4ed8");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Cleanup preview object URL (avoid memory leak)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const loadAnnouncements = async () => {
    try {
      setError("");
      const data = await announcementsApi.list();
      setAnnouncements(data as AnnouncementWithAttachments[]);
    } catch (err) {
      console.error(err);
      setError("Failed to load announcements");
    }
  };

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

  // Wrap selected text with [color=...][/color] (create)
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

  // Wrap selected text with [color=...][/color] (edit)
  const applyColorToEditSelection = () => {
    if (!editingPost) return;
    const el = editBodyRef.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const body = editingPost.body ?? "";

    if (start === end) {
      const insert = `[color=${editPickedColor}][/color]`;
      const newValue = body.slice(0, start) + insert + body.slice(end);
      setEditingPost({ ...editingPost, body: newValue });

      requestAnimationFrame(() => {
        el.focus();
        const cursorPos = start + `[color=${editPickedColor}]`.length;
        el.setSelectionRange(cursorPos, cursorPos);
      });
      return;
    }

    const selected = body.slice(start, end);
    const wrapped = `[color=${editPickedColor}]${selected}[/color]`;
    const newValue = body.slice(0, start) + wrapped + body.slice(end);
    setEditingPost({ ...editingPost, body: newValue });

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, start + wrapped.length);
    });
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setError("");

      const newPost = await announcementsApi.create({
        title: title.trim() || undefined,
        body: content,
        eventId: eventId ? Number(eventId) : undefined,
        visibility,
      });

      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);

        const token = localStorage.getItem("token");

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

      await loadAnnouncements();

      setTitle("");
      setContent("");
      clearImage();
    } catch (err: any) {
      setError(err?.message || "Failed to post announcement");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await announcementsApi.delete(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      if (editingPost?.id === id) setEditingPost(null);
    } catch {
      alert("Failed to delete announcement");
    }
  };

  // open edit mode
  const startEdit = (post: any) => {
    setEditingPost({
      id: post.id,
      eventId: post.eventId ? String(post.eventId) : "",
      visibility: getPostVisibility(post),
      title: post.title ?? "",
      body: post.body ?? "",
    });
    setEditPickedColor("#1d4ed8");
    requestAnimationFrame(() => editBodyRef.current?.focus());
  };

  // save edit
  const saveEdit = async () => {
    if (!editingPost) return;

    if (!editingPost.body.trim()) {
      alert("Body cannot be empty.");
      return;
    }

    try {
      setSavingEdit(true);

      const payload: any = {
        title: editingPost.title.trim() ? editingPost.title.trim() : null,
        body: editingPost.body,
        visibility: editingPost.visibility,
        eventId: editingPost.eventId ? Number(editingPost.eventId) : undefined,
      };

      await announcementsApi.update(editingPost.id, payload);

      // safest: reload (keeps attachments/comments consistent)
      await loadAnnouncements();

      setEditingPost(null);
    } catch (err: any) {
      alert(err?.message || "Failed to update announcement");
    } finally {
      setSavingEdit(false);
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

  const handleDeleteComment = async (announcementId: number, commentId: number) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await announcementsApi.deleteComment(commentId);
      setAnnouncements((prev) =>
        prev.map((post) => {
          if (post.id !== announcementId || !post.comments) return post;
          return { ...post, comments: post.comments.filter((c) => c.id !== commentId) };
        })
      );
    } catch {
      alert("Failed to delete comment");
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
          <Link to="/ohomepage" className="back-btn">
            ← Dashboard
          </Link>
          <Link to="/login" className="logout-btn">
            Logout
          </Link>
        </div>
      </header>

      <main className="announcements-container">
        <h1>Announcements</h1>

        {error && <p className="error-message">{error}</p>}

        {/* Create Post */}
        <div className="announcement-card create-post-card">
          <h2 className="section-title">Create New Post</h2>

          <form onSubmit={handlePost} className="post-form">
            <input
              type="number"
              placeholder="Event ID (Required)"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="form-control"
              required
            />

            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="form-control"
            >
              <option value="ORGA_ONLY">ORGA_ONLY (only Organizers)</option>
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

            {/* Simple color toolbar */}
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
                title="Select text in the textarea and click to apply color"
              >
                Apply to selection
              </button>

              <span style={{ fontSize: 13, color: "#666" }}>
                (wraps as <code>[color=...]...[/color]</code>)
              </span>
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

            <button type="submit" className="submit-post-btn">
              Post Announcement
            </button>
          </form>
        </div>

        {/* List */}
        <div className="announcements-list">
          {postList.length === 0 && <p>No announcements found.</p>}

          {postList.map((post) => {
            const firstAttachment = post.attachments?.[0];
            const imgSrc = resolveAssetUrl(firstAttachment?.url);
            const isEditingThis = editingPost?.id === post.id;

            return (
              <div key={post.id} className="announcement-card">
                <div className="post-header">
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <h2 className="post-title" style={{ margin: 0 }}>
                      {post.title || "Untitled"}
                    </h2>

                    {"visibility" in post && (post as any).visibility && (
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
                        {(post as any).visibility}
                      </span>
                    )}
                  </div>

                  <div className="post-meta">
                    <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>

                    {/*EDIT BUTTON */}
                    <button
                      onClick={() => startEdit(post)}
                      className="submit-post-btn"
                      style={{ padding: "10px 14px", marginRight: 10 }}
                      disabled={savingEdit}
                      title="Edit this announcement"
                    >
                      Edit
                    </button>

                    <button onClick={() => handleDelete(post.id)} className="delete-post-btn" disabled={savingEdit}>
                      Delete
                    </button>
                  </div>
                </div>

                {/*EDIT MODE */}
                {isEditingThis ? (
                  <div style={{ marginTop: 10 }}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Event ID"
                      value={editingPost?.eventId ?? ""}
                      onChange={(e) =>
                        setEditingPost((p) => (p ? { ...p, eventId: e.target.value } : p))
                      }
                    />

                    <select
                      value={editingPost?.visibility ?? "HIWI_ORGA"}
                      onChange={(e) =>
                        setEditingPost((p) =>
                          p ? { ...p, visibility: e.target.value as Visibility } : p
                        )
                      }
                      className="form-control"
                      style={{ marginTop: 10 }}
                    >
                      <option value="ORGA_ONLY">ORGA_ONLY (only Organizers)</option>
                      <option value="HIWI_ORGA">HIWI_ORGA (HiWis + Organizers)</option>
                      <option value="PUBLIC">PUBLIC (Everyone)</option>
                    </select>

                    <input
                      className="form-control"
                      placeholder="Post Title"
                      value={editingPost?.title ?? ""}
                      onChange={(e) =>
                        setEditingPost((p) => (p ? { ...p, title: e.target.value } : p))
                      }
                      style={{ marginTop: 10 }}
                    />

                    {/* Edit color toolbar */}
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
                      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 14, color: "#444" }}>Text color</span>
                        <input
                          type="color"
                          value={editPickedColor}
                          onChange={(e) => setEditPickedColor(e.target.value)}
                          style={{ width: 42, height: 32, padding: 0, border: "none", background: "transparent" }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={applyColorToEditSelection}
                        className="submit-post-btn"
                        style={{ padding: "10px 14px" }}
                        title="Select text and apply color"
                        disabled={savingEdit}
                      >
                        Apply to selection
                      </button>

                      <span style={{ fontSize: 13, color: "#666" }}>
                        (wraps as <code>[color=...]...[/color]</code>)
                      </span>
                    </div>

                    <textarea
                      ref={editBodyRef}
                      className="form-control"
                      rows={6}
                      placeholder="Body"
                      value={editingPost?.body ?? ""}
                      onChange={(e) =>
                        setEditingPost((p) => (p ? { ...p, body: e.target.value } : p))
                      }
                      style={{ marginTop: 10 }}
                      disabled={savingEdit}
                    />

                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                      <button
                        type="button"
                        className="submit-post-btn"
                        onClick={saveEdit}
                        disabled={savingEdit}
                      >
                        {savingEdit ? "Saving..." : "Save"}
                      </button>

                      <button
                        type="button"
                        className="comment-action-btn"
                        onClick={() => setEditingPost(null)}
                        disabled={savingEdit}
                      >
                        Cancel
                      </button>
                    </div>

                    {/* preview (optional ama faydalı) */}
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 12,
                        background: "rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Preview</div>
                      <div style={{ whiteSpace: "normal" }}>
                        {renderColoredText(editingPost?.body ?? "")}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal render
                  <div className="post-body" style={{ whiteSpace: "normal" }}>
                    {renderColoredText(post.body)}
                  </div>
                )}

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

                {/* Comments */}
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
                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>

                          {editingComment?.id === comment.id ? (
                            <div className="edit-comment-form">
                              <input
                                value={editingComment.body}
                                onChange={(e) =>
                                  setEditingComment({ ...editingComment, body: e.target.value })
                                }
                                className="edit-comment-input"
                              />
                              <button onClick={saveEditComment} className="comment-action-btn">
                                Save
                              </button>
                              <button
                                onClick={() => setEditingComment(null)}
                                className="comment-action-btn"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="comment-content">
                              <p className="comment-text">{comment.body}</p>
                              <div className="comment-actions">
                                <button
                                  onClick={() =>
                                    setEditingComment({ id: comment.id, body: comment.body })
                                  }
                                  className="icon-btn edit"
                                  title="Edit"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  className="icon-btn delete"
                                  title="Delete"
                                >
                                  🗑
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
                        <button
                          onClick={() => submitComment(post.id)}
                          className="post-comment-btn"
                        >
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