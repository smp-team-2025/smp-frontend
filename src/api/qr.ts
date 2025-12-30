const API_BASE_URL = "http://localhost:3000/api";

export const qrApi = {
    async getMe(): Promise<{ id: number; name: string; email: string; role: string }> {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user info");
        }
        return response.json();
    },

    /**
     
     */
    async getUserQrCode(userId: number | string): Promise<string> {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/users/${userId}/qrcode`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(errorData.error || "Failed to fetch QR code");
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    },

    /**
     
     */
    async getBusinessCardPdf(userId: number | string): Promise<string> {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/users/${userId}/business-card.pdf`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(errorData.error || "Failed to fetch Business Card PDF");
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    },

    /**
     
     */
    async submitScan(qrContent: string): Promise<{ success: boolean; message: string }> {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/attendance/scan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ qrContent }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Scan failed");
        }
        return data;
    },

    /**
     * Fetches attendance statistics for the last 7 days.
     */
    async getAttendanceStats(): Promise<any> {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/attendance/stats`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch attendance stats");
        }
        return response.json();
    }
};