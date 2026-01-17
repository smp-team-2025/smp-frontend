import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { announcementsApi, type Announcement, type AnnouncementComment } from "../api/announcements";
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
                    <span className="logo">SMP 2026 - Organizer</span>
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

                {/* Create Post an Announcement */}
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
                        <input
                            type="text"
                            placeholder="Post Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-control"
                        />
                        <textarea
                            placeholder="Write your announcement here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="form-control"
                        />
                        
                        <div className="image-section">
                            <div className="file-input-wrapper">
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
                                {selectedImage && <span className="file-name">{selectedImage.name}</span>}
                            </div>

                            {previewUrl && (
                                <div className="preview-wrapper">
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        className="preview-img"
                                    />
                                    <button type="button" onClick={clearImage} className="clear-btn"></button>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="submit-post-btn">
                            Post Announcement
                        </button>
                    </form>
                </div>

                {/* List of Announcements */}
                <div className="announcements-list">
                    {announcements.length === 0 && <p>No announcements found.</p>}
                    {announcements.map((post) => (
                        <div key={post.id} className="announcement-card">
                            <div className="post-header">
                                <h2 className="post-title">{post.title || "Untitled"}</h2>
                                <div className="post-meta">
                                    <span className="post-date">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                    <button 
                                        onClick={() => handleDelete(post.id)}
                                        className="delete-post-btn"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <p className="post-body">{post.body}</p>
                            {post.attachments && post.attachments.length > 0 && (
                                <div className="post-attachment">
                                    <img 
                                        src={post.attachments[0].url} 
                                        alt="Attachment" 
                                        className="attachment-img"
                                    />
                                </div>
                            )}

                            {/* Comments Part */}
                            <div className="comments-section">
                                <button 
                                    onClick={() => toggleComments(post.id)}
                                    className="toggle-comments-btn"
                                >
                                    {post.showComments ? "Hide Comments" : `Show Comments`}
                                </button>
                                
                                {post.showComments && (
                                    <div className="comments-list">
                                        {/* Listing the Comments */}
                                        {post.comments?.map(comment => (
                                            <div key={comment.id} className="comment-item">
                                                <div className="comment-meta">
                                                    <span>{comment.author.name}</span>
                                                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                
                                                {editingComment?.id === comment.id ? (
                                                    <div className="edit-comment-form">
                                                        <input 
                                                            value={editingComment.body}
                                                            onChange={(e) => setEditingComment({ ...editingComment, body: e.target.value })}
                                                            className="edit-comment-input"
                                                        />
                                                        <button onClick={saveEditComment} className="comment-action-btn">Save</button>
                                                        <button onClick={() => setEditingComment(null)} className="comment-action-btn">Cancel</button>
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
                                        
                                        {/* Adding Comments */}
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
                    ))}
                </div>
            </main>
        </div>
    );
}