const API_BASE = "/api/announcements";

export interface Announcement {
    id: number;
    title: string | null;
    body: string;
    createdAt: string;
    authorId: number;
    author: {
        id: number;
        name: string;
        role: string;
    };
    attachments?: {
        id: number;
        url: string;
        mimeType: string;
    }[];
}

export interface AnnouncementComment {
    id: number;
    body: string;
    createdAt: string;
    author: {
        id: number;
        name: string;
        role: string;
    };
}

function getToken() {
    return localStorage.getItem("token");
}

async function request(url: string, options: RequestInit = {}) {
    const token = getToken();
    const headers = new Headers(options.headers);

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) return null;

    return response.json();
}

export const announcementsApi = {
    list: () => request(API_BASE),
    create: (data: { title?: string; body: string; eventId?: number }) => 
        request(API_BASE, { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => request(`${API_BASE}/${id}`, { method: "DELETE" }),
    
    getComments: (id: number) => request(`${API_BASE}/${id}/comments`),
    createComment: (announcementId: number, body: string) => 
        request(`${API_BASE}/${announcementId}/comments`, { method: "POST", body: JSON.stringify({ body }) }),
    updateComment: (commentId: number, body: string) => 
        request(`${API_BASE}/comments/${commentId}`, { method: "PATCH", body: JSON.stringify({ body }) }),
    deleteComment: (commentId: number) => 
        request(`${API_BASE}/comments/${commentId}`, { method: "DELETE" }),
};