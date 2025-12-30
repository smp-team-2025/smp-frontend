import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { announcementsApi, type Announcement } from "../api/announcements";
import "./ohomepage.css";

export default function OrganizerAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [eventId, setEventId] = useState<string>("1"); // Defaulting to 1 for simplicity, backend requires ID
    const [error, setError] = useState("");

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const data = await announcementsApi.list();
            setAnnouncements(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load announcements");
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
            
            setAnnouncements([newPost, ...announcements]);
            setTitle("");
            setContent("");
            setError("");
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
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}