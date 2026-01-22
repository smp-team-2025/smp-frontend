import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  announcementsApi,
  type Announcement,
  type AnnouncementComment,
} from "../api/announcements";
import "./organizerannouncements.css";

type Visibility = "ORGA_ONLY" | "HIWI_ORGA" | "PUBLIC";

interface Attachment {
  id: number;
  url: string;
  mimeType: string;
}

interface AnnouncementWithExtras extends Announcement {
  attachments?: Attachment[];
  comments?: AnnouncementComment[];
  showComments?: boolean;
  visibility?: Visibility;
}

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
 * [color=...]...[/color] + \n -> <br/>
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

function getMyUserIdFromToken(): number | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return Number(payload.userId ?? payload.sub ?? payload.id ?? null) || null;
  } catch {
    return null;
  }
}

export default function HiwiAnnouncements() {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState<AnnouncementWithExtras[]>([]);
  const [error, setError] = useState("");

  // create
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [eventId, setEventId] = useState<string>("1");
  const [visibility, setVisibility] = useState<Visibility>("HIWI_ORGA");

  // color tool
  const [pickedColor, setPickedColor] = useState<string>("#1d4ed8");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // attachment
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // comments
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [editingComment, setEditingComment] = useState<{ id: number; body: string } | null>(null);

  // announcement edit
  const [editingPost, setEditingPost] = useState<{
    id: number;
    title: string;
    body: string;
    visibility: Visibility;
  } | null>(null);

  const myUserId = useMemo(() => getMyUserIdFromToken(), []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const loadAnnouncements = async () => {
    try {
      setError("");
      const data = (await announcementsApi.list()) as AnnouncementWithExtras[];

    const filtered = data.filter((p) => {
        const v = (p as any).visibility as Visibility | undefined;
        return v === "HIWI_ORGA" || v === "PUBLIC";
    }); 
     setAnnouncements(filtered);
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

    try {
      setError("");

      const safeVisibility: Visibility =
        visibility === "ORGA_ONLY" ? "HIWI_ORGA" : visibility;

      const newPost = await announcementsApi.create({
        title: title.trim() || undefined,
        body: content,
        eventId: eventId ? Number(eventId) : undefined,
        visibility: safeVisibility,
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

      setTitle("");
      setContent("");
      clearImage();
      await loadAnnouncements();
    } catch (err: any) {
      setError(err?.message || "Failed to create announcement");
    }
  };

  const startEditPost = (post: AnnouncementWithExtras) => {
    setEditingPost({
      id: post.id,
      title: post.title ?? "",
      body: post.body ?? "",
      visibility: ((post as any).visibility as Visibility) || "HIWI_ORGA",
    });
  };

  const cancelEditPost = () => setEditingPost(null);

  const saveEditPost = async () => {
    if (!editingPost) return;

    try {
      setError("");
      await announcementsApi.update(editingPost.id, {
        title: editingPost.title.trim() || undefined,
        body: editingPost.body,
        visibility: editingPost.visibility,
      });

      setEditingPost(null);
      await loadAnnouncements();
    } catch (err: any) {
      setError(err?.message || "Failed to update announcement");
    }
  };

  const deletePost = async (id: number) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await announcementsApi.delete(id);
      setAnnouncements((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete announcement");
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
    const updated = await announcementsApi.updateComment(
      editingComment.id,
      editingComment.body
    );

    setAnnouncements((prev) =>
      prev.map((post) => {
        if (!post.comments) return post;

        const has = post.comments.some((c) => c.id === editingComment.id);
        if (!has) return post;

        return {
          ...post,
          comments: post.comments.map((c) => {
            if (c.id !== editingComment.id) return c;

            return {
              ...c,
              ...updated,
              author: (updated as any).author ?? c.author,
            };
          }),
        };
      })
    );

    setEditingComment(null);
  } catch (err) {
    console.error(err);
    alert("Failed to update comment");
  }
};

  const deleteComment = async (announcementId: number, commentId: number) => {
    if (!window.confirm("Delete this comment?")) return;
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
          <Link to="/hiwihomepage" className="back-btn">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="announcements-container">
        <h1>Announcements (Hiwi)</h1>

        {error && <p className="error-message">{error}</p>}

        {/* CREATE */}
        <div className="announcement-card create-post-card">
          <h2 className="section-title">Create New Post</h2>

          <form onSubmit={handleCreate} className="post-form">
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

            {/* Color toolbar */}
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

            {/* Attachment */}
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

        {/* LIST */}
        <div className="announcements-list">
          {postList.length === 0 && <p>No announcements found.</p>}

          {postList.map((post) => {
            const firstAttachment = post.attachments?.[0];
            const imgSrc = resolveAssetUrl(firstAttachment?.url);
            const postVisibility = ((post as any).visibility as Visibility | undefined) ?? undefined;

            const canEditPost = myUserId != null && post.authorId === myUserId;
            const canDeletePost = canEditPost;

            return (
              <div key={post.id} className="announcement-card">
                <div className="post-header">
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <h2 className="post-title" style={{ margin: 0 }}>
                      {post.title || "Untitled"}
                    </h2>

                    {postVisibility && (
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
                        {postVisibility}
                      </span>
                    )}
                  </div>

                  <div className="post-meta">
                    <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>

                    {canEditPost && (
                      <button
                        onClick={() => startEditPost(post)}
                        className="delete-post-btn"
                        style={{ background: "#2563eb", marginRight: 8 }}
                        title="Edit"
                      >
                        Edit
                      </button>
                    )}

                    {canDeletePost && (
                      <button onClick={() => deletePost(post.id)} className="delete-post-btn" title="Delete">
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* EDIT MODE */}
                {editingPost?.id === post.id ? (
                  <div style={{ marginTop: 10 }}>
                    <input
                      className="form-control"
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                      placeholder="Title"
                    />

                    <select
                      className="form-control"
                      style={{ marginTop: 10 }}
                      value={editingPost.visibility}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, visibility: e.target.value as Visibility })
                      }
                    >
                      <option value="HIWI_ORGA">HIWI_ORGA (HiWis + Organizers)</option>
                      <option value="PUBLIC">PUBLIC (Everyone)</option>
                    </select>

                    <textarea
                      className="form-control"
                      style={{ marginTop: 10 }}
                      rows={6}
                      value={editingPost.body}
                      onChange={(e) => setEditingPost({ ...editingPost, body: e.target.value })}
                    />

                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                      <button onClick={saveEditPost} className="submit-post-btn" type="button">
                        Save
                      </button>
                      <button onClick={cancelEditPost} className="submit-post-btn" type="button">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="post-body" style={{ whiteSpace: "normal" }}>
                    {renderColoredText(post.body)}
                  </div>
                )}

                {post.author?.name && (
                    <div
                        style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: "#666",
                        fontStyle: "italic",
                        textAlign: "right",
                    }}
                    >
                    — {post.author.name}
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

                {/* COMMENTS */}
                <div className="comments-section">
                  <button onClick={() => toggleComments(post.id)} className="toggle-comments-btn">
                    {post.showComments ? "Hide Comments" : "Show Comments"}
                  </button>

                  {post.showComments && (
                    <div className="comments-list">
                      {post.comments?.map((comment) => {
                        const canEditComment = myUserId != null && comment.author.id === myUserId;
                        const canDeleteComment = canEditComment;

                        return (
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
                                <button
                                    type="button"
                                    onClick={saveEditComment}
                                    className="comment-action-btn"
                                    style={{ background: "#2563eb", color: "#fff", border: "none" }}
                                    >
                                    Save
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEditingComment(null)}
                                    className="comment-action-btn"
                                    style={{ background: "rgba(0,0,0,0.08)", color: "#111", border: "none" }}
                                >
                                    Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="comment-content">
                                <p className="comment-text">{comment.body}</p>
                                <div className="comment-actions">
                                  {canEditComment && (
                                    <button
                                      onClick={() => setEditingComment({ id: comment.id, body: comment.body })}
                                      className="icon-btn edit"
                                      title="Edit"
                                    >
                                      ✎
                                    </button>
                                  )}
                                  {canDeleteComment && (
                                    <button
                                      onClick={() => deleteComment(post.id, comment.id)}
                                      className="icon-btn delete"
                                      title="Delete"
                                    >
                                      🗑
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

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