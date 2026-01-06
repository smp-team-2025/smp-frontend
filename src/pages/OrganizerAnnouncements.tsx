import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { announcementsApi, type Announcement, type AnnouncementComment } from "../api/announcements";
import "./ohomepage.css";

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

export default function OrganizerAnnouncements() {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState<AnnouncementWithAttachments[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [eventId, setEventId] = useState<string>("1"); // Defaulting to 1 for simplicity, backend requires ID
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
    const [editingComment, setEditingComment] = useState<{ id: number, body: string } | null>(null);

    useEffect(() => {
        // const token = localStorage.getItem("token");
        // if (!token) {
        //     navigate("/login");
        // }
        loadAnnouncements();
    }, [navigate]);

    const loadAnnouncements = async () => {
        try {
            const data = await announcementsApi.list();
            setAnnouncements(data as AnnouncementWithAttachments[]);
        } catch (err) {
            console.error(err);
            setError("Failed to load announcements");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            const newPost = await announcementsApi.create({
                title: title.trim() || undefined,
                body: content,
                eventId: eventId ? Number(eventId) : undefined,
            });
            
            let uploadedAttachment = null;

            if (selectedImage) {
                const formData = new FormData();
                formData.append("file", selectedImage);
                const token = localStorage.getItem("token");

                const uploadRes = await fetch(`/api/announcements/${newPost.id}/attachments`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });

                if (uploadRes.ok) {
                    uploadedAttachment = await uploadRes.json();
                } else {
                    console.error("Failed to upload image");
                }
            }

            const postToDisplay: AnnouncementWithAttachments = {
                ...newPost,
                attachments: uploadedAttachment ? [uploadedAttachment] : []
            };

            setAnnouncements([postToDisplay, ...announcements]);
            setTitle("");
            setContent("");
            setError("");
            clearImage();
        } catch (err: any) {
            setError(err.message || "Failed to post announcement");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await announcementsApi.delete(id);
            setAnnouncements(announcements.filter((a) => a.id !== id));
        } catch (err) {
            alert("Failed to delete announcement");
        }
    };

    const toggleComments = async (announcementId: number) => {
        const postIndex = announcements.findIndex(a => a.id === announcementId);
        if (postIndex === -1) return;
        
        const post = announcements[postIndex];
        const newShowComments = !post.showComments;
        
        // Optimistic toggle
        const updatedAnnouncements = [...announcements];
        updatedAnnouncements[postIndex] = { ...post, showComments: newShowComments };
        setAnnouncements(updatedAnnouncements);

        if (newShowComments && !post.comments) {
            try {
                const comments = await announcementsApi.getComments(announcementId);
                setAnnouncements(prev => prev.map(a => 
                    a.id === announcementId ? { ...a, comments } : a
                ));
            } catch (err) {
                console.error("Failed to load comments", err);
            }
        }
    };

    const handleCommentInputChange = (announcementId: number, value: string) => {
        setCommentInputs(prev => ({ ...prev, [announcementId]: value }));
    };

    const submitComment = async (announcementId: number) => {
        const body = commentInputs[announcementId];
        if (!body?.trim()) return;
        
        try {
            const newComment = await announcementsApi.createComment(announcementId, body);
            setAnnouncements(prev => prev.map(a => {
                if (a.id === announcementId) {
                    return { ...a, comments: [...(a.comments || []), newComment] };
                }
                return a;
            }));
            setCommentInputs(prev => ({ ...prev, [announcementId]: "" }));
        } catch (err) {
            alert("Failed to add comment");
        }
    };

    const saveEditComment = async () => {
        if (!editingComment) return;
        try {
            const updated = await announcementsApi.updateComment(editingComment.id, editingComment.body);
            setAnnouncements(prev => prev.map(post => {
                if (post.comments?.some(c => c.id === editingComment.id)) {
                    return {
                        ...post,
                        comments: post.comments.map(c => c.id === editingComment.id ? updated : c)
                    };
                }
                return post;
            }));
            setEditingComment(null);
        } catch (err) {
            alert("Failed to update comment");
        }
    };

    const handleDeleteComment = async (announcementId: number, commentId: number) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await announcementsApi.deleteComment(commentId);
            setAnnouncements(prev => prev.map(post => {
                if (post.id === announcementId && post.comments) {
                    return {
                        ...post,
                        comments: post.comments.filter(c => c.id !== commentId)
                    };
                }
                return post;
            }));
        } catch (err) {
            alert("Failed to delete comment");
        }
    };

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <div className="nav-left">
                    <span className="logo">SMP 2026</span>
                </div>
                <div className="nav-right" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Link to="/ohomepage" className="back-btn" style={{ color: 'white', textDecoration: 'none' }}>
                        ← Back
                    </Link>
                    <Link to="/login" className="logout-btn">
                        Logout
                    </Link>
                </div>
            </header>

            <main className="container">
                <h1>Announcements</h1>

                {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

                {/* Create Post an Announcement */}
                <div className="card" style={{ transform: "none", cursor: "default", marginBottom: "40px" }}>
                    <h2 style={{ marginBottom: "20px" }}>Create New Post</h2>
                    <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <input
                            type="number"
                            placeholder="Event ID (Required)"
                            value={eventId}
                            onChange={(e) => setEventId(e.target.value)}
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem" }}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Post Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem" }}
                        />
                        <textarea
                            placeholder="Write your announcement here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem", resize: "vertical" }}
                        />
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <label 
                                    htmlFor="image-upload" 
                                    className="add-image-btn"
                                >
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
                                {selectedImage && <span style={{ fontSize: "0.9rem", color: "#666" }}>{selectedImage.name}</span>}
                            </div>

                            {previewUrl && (
                                <div style={{ position: "relative", width: "fit-content" }}>
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px", border: "1px solid #ddd" }} 
                                    />
                                    <button type="button" onClick={clearImage} style={{ position: "absolute", top: "-8px", right: "-8px", background: "red", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="logout-btn" style={{ background: "#0b63b6", color: "white", alignSelf: "flex-start", border: "none", cursor: "pointer" }}>
                            Post Announcement
                        </button>
                    </form>
                </div>

                {/* List of Announcements */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {announcements.length === 0 && <p>No announcements found.</p>}
                    {announcements.map((post) => (
                        <div key={post.id} className="card" style={{ transform: "none", cursor: "default" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                <h2 style={{ fontSize: "1.4rem", margin: 0 }}>{post.title || "Untitled"}</h2>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <span style={{ color: "#888", fontSize: "0.9rem" }}>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                    <button 
                                        onClick={() => handleDelete(post.id)}
                                        style={{ background: "red", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <p style={{ whiteSpace: "pre-wrap" }}>{post.body}</p>
                            {post.attachments && post.attachments.length > 0 && (
                                <div style={{ marginTop: "15px" }}>
                                    <img 
                                        src={post.attachments[0].url} 
                                        alt="Attachment" 
                                        style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px", objectFit: "contain" }} 
                                    />
                                </div>
                            )}

                            {/* Comments Part */}
                            <div style={{ marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                                <button 
                                    onClick={() => toggleComments(post.id)}
                                    style={{ background: "none", border: "none", color: "#0b63b6", cursor: "pointer", padding: 0, fontSize: "0.9rem" }}
                                >
                                    {post.showComments ? "Hide Comments" : `Show Comments`}
                                </button>
                                
                                {post.showComments && (
                                    <div style={{ marginTop: "10px", paddingLeft: "10px" }}>
                                        {/* Listing the Comments */}
                                        {post.comments?.map(comment => (
                                            <div key={comment.id} style={{ marginBottom: "8px", background: "#f9f9f9", padding: "8px", borderRadius: "4px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>
                                                    <span>{comment.author.name}</span>
                                                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                
                                                {editingComment?.id === comment.id ? (
                                                    <div style={{ display: "flex", gap: "5px" }}>
                                                        <input 
                                                            value={editingComment.body}
                                                            onChange={(e) => setEditingComment({ ...editingComment, body: e.target.value })}
                                                            style={{ flex: 1, padding: "4px" }}
                                                        />
                                                        <button onClick={saveEditComment} style={{ fontSize: "0.8rem", cursor: "pointer" }}>Save</button>
                                                        <button onClick={() => setEditingComment(null)} style={{ fontSize: "0.8rem", cursor: "pointer" }}>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <p style={{ margin: 0, fontSize: "0.95rem" }}>{comment.body}</p>
                                                        <div>
                                                            <button 
                                                                onClick={() => setEditingComment({ id: comment.id, body: comment.body })}
                                                                style={{ fontSize: "0.8rem", background: "none", border: "none", color: "#888", cursor: "pointer", marginRight: "8px" }}
                                                                title="Edit"
                                                            >
                                                                ✎
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                                                style={{ fontSize: "0.8rem", background: "none", border: "none", color: "#dc3545", cursor: "pointer" }}
                                                                title="Delete"
                                                            >
                                                                🗑
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {/* Adding Comments */}
                                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                                            <input 
                                                type="text" 
                                                placeholder="Write a comment..." 
                                                value={commentInputs[post.id] || ""}
                                                onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                                                style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                                            />
                                            <button 
                                                onClick={() => submitComment(post.id)}
                                                style={{ background: "#0b63b6", color: "white", border: "none", borderRadius: "4px", padding: "0 12px", cursor: "pointer" }}
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}