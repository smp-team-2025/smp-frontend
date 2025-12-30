const API_BASE_URL = "http://localhost:3000/api";

export interface Announcement {
    id: number;
    title: string | null;
    body: string;
    createdAt: string;
    authorId: number;
    eventId: number | null;
    sessionId: number | null;
    author?: {
        id: number;
        name: string;
        role: string;
    };
}

export const announcementsApi = {
   
    async list(params?: { eventId?: number; sessionId?: number }): Promise<Announcement[]> {
        const token = localStorage.getItem("token");
        const query = new URLSearchParams();
        if (params?.eventId) query.append("eventId", params.eventId.toString());
        if (params?.sessionId) query.append("sessionId", params.sessionId.toString());

        const response = await fetch(`${API_BASE_URL}/announcements?${query.toString()}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch announcements");
        }
        return response.json();
    },

    
    async create(data: { title?: string; body: string; eventId?: number; sessionId?: number }): Promise<Announcement> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/announcements`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || "Failed to create announcement");
        }
        return response.json();
    },

    async delete(id: number): Promise<void> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Failed to delete announcement");
        }
    }
};