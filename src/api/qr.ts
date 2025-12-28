const API_BASE_URL = "http://localhost:3000/api";

export const qrApi = {
    /**
     * Fetches the QR code PNG for a specific user.
     * Returns a Blob URL string that can be used as an image source.
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
     * Submits a scanned QR code string to record attendance.
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
    }
};