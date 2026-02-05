export async function getActiveEvent(headers: HeadersInit) {
  const res = await fetch("/api/events/active", { headers });
  if (!res.ok) throw new Error("Aktives Event konnte nicht geladen werden.");
  return res.json() as Promise<{ id: number; title: string }>;
}