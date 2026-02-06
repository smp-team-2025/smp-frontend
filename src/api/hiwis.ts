export type HiwiListItem = {
    user: { id: number; email: string; name: string; role: string; createdAt: string };
    hiwi: { id: number; clothingSize: string | null; userId?: number };
};

function getToken() {
    return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
    const token = getToken();
    return { Authorization: `Bearer ${token}` };
}

export async function listHiwis(): Promise<HiwiListItem[]> {
    const res = await fetch("/api/hiwis", { headers: authHeaders() });
    if (!res.ok) throw new Error(`Failed to load HiWis (${res.status})`);
    return res.json();
}

export async function createHiwi(payload: { email: string; name: string; clothingSize?: string | null }) {
    const res = await fetch("/api/hiwis", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Create failed (${res.status})`);
    return data as HiwiListItem;
}

export async function updateHiwi(hiwiId: number, payload: { name?: string | null; clothingSize?: string | null }) {
    const res = await fetch(`/api/hiwis/${hiwiId}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Update failed (${res.status})`);
    return data as HiwiListItem;
}

export async function deleteHiwi(hiwiId: number) {
    const res = await fetch(`/api/hiwis/${hiwiId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Delete failed (${res.status})`);
    }
}