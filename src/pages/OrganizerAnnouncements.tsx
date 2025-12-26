import { useState } from "react";
import { Link } from "react-router-dom";
import "./ohomepage.css";

interface Announcement {
    id: number;
    title: string;
    content: string;
    date: string;
}

export default function OrganizerAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([
        { id: 1, title: "Welcome to SMP 2026", content: "We are excited to start the new semester!", date: "2025-10-01" }
    ]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handlePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        const newPost: Announcement = {
            id: Date.now(),
            title,
            content,
            date: new Date().toISOString().split('T')[0]
        };

        setAnnouncements([newPost, ...announcements]);
        setTitle("");
        setContent("");
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

                {/* Create Post Form */}
                <div className="card" style={{ transform: "none", cursor: "default", marginBottom: "40px" }}>
                    <h2 style={{ marginBottom: "20px" }}>Create New Post</h2>
                    <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
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

                {/* Announcement List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {announcements.map((post) => (
                        <div key={post.id} className="card" style={{ transform: "none", cursor: "default" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                <h2 style={{ fontSize: "1.4rem", margin: 0 }}>{post.title}</h2>
                                <span style={{ color: "#888", fontSize: "0.9rem" }}>{post.date}</span>
                            </div>
                            <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}