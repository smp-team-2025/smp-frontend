const API_BASE_URL = `/api`;

export type DiplomaIssued = {
  id: number;
  certificateNumber: string;
  issuedAt: string;
  createdAt: string;

  participant: {
    id: number;
    name: string;
    email?: string | null;
    registration?: {
      school: string;
    } | null;
  };

  event: {
    id: number;
    title: string;
    startDate?: string | null;
    endDate?: string | null;
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
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(data?.error || `Request failed (${res.status})`);
    }
    const result = await res.json();
    return Array.isArray(result) ? result : [];
  },

  // Organizer or participant: list diplomas of a participant
  async listByParticipant(participantId: number): Promise<DiplomaIssued[]> {
    const res = await authedFetch(`/diplomas/participant/${participantId}`, { method: "GET" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(data?.error || `Request failed (${res.status})`);
    }
    const result = await res.json();
    return Array.isArray(result) ? result : [];
  },

  // Download PDF (Organizer or own)
  async downloadPdf(participantId: number, eventId: number): Promise<Blob> {
    const res = await authedFetch(`/diplomas/${participantId}/${eventId}`, { method: "GET" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(data?.error || `Download failed (${res.status})`);
    }
    return await res.blob();
  },
};