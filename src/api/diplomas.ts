const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/api`;

export type DiplomaIssued = {
  certificateNumber: string;
  issuedAt: string;

  participant: {
    id: number;
    name: string;
    email?: string | null;
  };

  event: {
    id: number;
    title: string;
  };
};

async function authedFetch(path: string, init?: RequestInit) {
  const token = localStorage.getItem("token");
  const headers = new Headers(init?.headers || undefined);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}

export const diplomasApi = {
  // Organizer: issued diplomas list for an event
  async listIssuedByEvent(eventId: number): Promise<DiplomaIssued[]> {
    const res = await authedFetch(`/diplomas/event/${eventId}/issued`, { method: "GET" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Request failed (${res.status})`);
    }
    return (await res.json()) as DiplomaIssued[];
  },

  // Organizer or participant: list diplomas of a participant
  async listByParticipant(participantId: number): Promise<DiplomaIssued[]> {
    const res = await authedFetch(`/diplomas/participant/${participantId}`, { method: "GET" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Request failed (${res.status})`);
    }
    return (await res.json()) as DiplomaIssued[];
  },

  // Download PDF (Organizer or own)
  async downloadPdf(participantId: number, eventId: number): Promise<Blob> {
    const res = await authedFetch(`/diplomas/${participantId}/${eventId}`, { method: "GET" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Download failed (${res.status})`);
    }
    return await res.blob();
  },
};
