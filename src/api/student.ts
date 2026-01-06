export interface StudentSession {
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

export const studentApi = {
    getMySessions: async (): Promise<StudentSession[]> => {
        const token = localStorage.getItem("token");
        // Assuming endpoint /api/students/sessions exists
        const res = await fetch("/api/students/sessions", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Failed to fetch sessions");
        return res.json();
    },
};