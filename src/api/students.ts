export type ParticipantUpdate = {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    street?: string;
    addressExtra?: string | null;
    zipCode?: string;
    city?: string;
    school?: string;
    grade?: string;
};

function authHeaders(): HeadersInit {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export async function updateParticipant(registrationId: number, payload: ParticipantUpdate) {
    const res = await fetch(`/api/students/${registrationId}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Update failed (${res.status})`);
    return data;
}

export async function deleteParticipant(registrationId: number) {
    const res = await fetch(`/api/students/${registrationId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });

    if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Delete failed (${res.status})`);
    }
}
