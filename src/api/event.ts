export async function getActiveEvent(headers: HeadersInit) {
  const res = await fetch("/api/events/active", { headers });
  if (!res.ok) throw new Error("Aktives Event konnte nicht geladen werden.");
  return res.json() as Promise<{
    id: number;
    title: string;
    registrationClosesAt: string | null;
  }>;
}

export async function updateRegistrationDeadline(
  eventId: number,
  headers: HeadersInit,
  deadlineIsoOrNull: string | null
) {
  const res = await fetch(`/api/events/${eventId}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ registrationClosesAt: deadlineIsoOrNull }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return res.json() as Promise<{
    id: number;
    title: string;
    registrationClosesAt: string | null;
  }>;
}

export async function getEventById(eventId: number, headers: HeadersInit) {
  const res = await fetch(`/api/events/${eventId}`, { headers });
  if (!res.ok) throw new Error("Eventdaten konnten nicht geladen werden.");
  return res.json() as Promise<any>;
}

export async function updateApprovalEmailSettings(
  eventId: number,
  headers: HeadersInit,
  payload: { approvalEmailSubject: string | null; approvalEmailIntro: string | null }
) {
  const res = await fetch(`/api/events/${eventId}/approval-email-settings`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return res.json();
}