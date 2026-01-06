export interface HiwiSession {
    id: number;
    hiwiId: number;
    sessionId: number;
    session: {
        id: number;
        title: string;
        startsAt: string;
        endsAt: string;
        location: string;
        event: {
            id: number;
            title: string;
        }
    }
}

export const hiwiApi = {
    getMySessions: async (): Promise<HiwiSession[]> => {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/hiwis/sessions", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Failed to fetch sessions");
        return res.json();
    },
};