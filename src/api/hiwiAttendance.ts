const API_BASE_URL = "/api";

export type AvailabilityStatus = "AVAILABLE" | "MAYBE" | "UNAVAILABLE";

export type HiwiMySession = {
  id: number; // hiwiSessionId
  status: AvailabilityStatus | null;
  session: {
    id: number;
    title: string;
    startsAt: string;
    location?: string | null;
    event?: { id: number; title: string };
  };
};

export type OrganizerSessionHiwiAttendance = {
  session: {
    id: number;
    title: string;
    startsAt: string;
    location?: string | null;
  };
  hiwis: Array<{
    hiwiId: number;
    userId: number;
    name: string;
    email: string;
    status: AvailabilityStatus | null;
  }>;
};

async function authedFetch(path: string, init?: RequestInit) {
  const token = localStorage.getItem("token");
  const headers = new Headers(init?.headers || undefined);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}

export const hiwiAttendanceApi = {
  // HIWI: assigned sessions + current status
  async mySessions(): Promise<HiwiMySession[]> {
    const res = await authedFetch("/hiwis/sessions", { method: "GET" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to load sessions (${res.status}): ${text}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  // HIWI: update own availability for one assignment
  async setStatus(hiwiSessionId: number, status: AvailabilityStatus): Promise<void> {
    const res = await authedFetch(`/hiwi-sessions/${hiwiSessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Update failed (${res.status}): ${text}`);
    }
  },

  // ORGANIZER: read-only overview per session for event
  async organizerByEvent(eventId: number): Promise<OrganizerSessionHiwiAttendance[]> {
    const res = await authedFetch(`/events/${eventId}/hiwi-attendance`, { method: "GET" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to load attendance (${res.status}): ${text}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
};