import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./EventListPage.css";

export type EventDto = {
  id: number;
  title: string;
  description?: string | null;
  startDate?: string | null; // ISO string
  endDate?: string | null; // ISO string
  isActive: boolean;
};

type SavePayload = {
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
};

function toDateInputValue(date?: string | null) {
  if (!date) return "--";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "--";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

function compareActiveThenTitle(a: EventDto, b: EventDto) {
  const activeDiff = Number(b.isActive) - Number(a.isActive);
  if (activeDiff !== 0) return activeDiff;
  return (a.title || "").localeCompare(b.title || "");
}


export default function EventListPage() {
  const navigate = useNavigate();

  const token = useMemo(() => localStorage.getItem("token"), []);

  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EventDto | null>(null);

  // form state
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const authHeaders = useMemo(() => {
    const h: Record<string, string> = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    void loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, token]);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/events", { headers: authHeaders });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to load events (${res.status}) ${txt}`);
      }

      const data = (await res.json()) as EventDto[];
      data.sort(compareActiveThenTitle);
      setEvents(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
  };

  const openCreate = () => {
    setEditingEvent(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (ev: EventDto) => {
    setEditingEvent(ev);
    setTitle(ev.title || "");
    setDescription(ev.description || "");
    setStartDate(toDateInputValue(ev.startDate));
    setEndDate(toDateInputValue(ev.endDate));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    resetForm();
  };

  const validateForm = (): string | null => {
    if (!title.trim()) return "Bitte geben Sie einen Titel ein.";

    // date validation only if both provided
    if (startDate && endDate && startDate > endDate) {
      return "Enddatum darf nicht vor dem Startdatum liegen.";
    }

    return null;
  };

  const buildPayload = (): SavePayload => ({
    title: title.trim(),
    description: description.trim() ? description.trim() : null,
    startDate: startDate ? startDate : null,
    endDate: endDate ? endDate : null,
  });

  const saveEvent = async () => {
    const msg = validateForm();
    if (msg) {
      alert(msg);
      return;
    }

    const payload = buildPayload();

    try {
      setError("");

      if (editingEvent) {
        const res = await fetch(`/api/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Update failed (${res.status}) ${txt}`);
        }
      } else {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Create failed (${res.status}) ${txt}`);
        }
      }

      closeModal();
      await loadEvents();
    } catch (e: any) {
      setError(e?.message || "Save failed");
    }
  };

  /**
   * Not: ideal olan backend'de "setActive" endpointi olması:
   *   POST /api/events/:id/activate  (tek aktif event enforce)
   * Şimdilik mevcut backend'e uyumlu şekilde:
   *  - hepsini PUT ile update ediyoruz (yavaş ama basit).
   */
  const setActiveEvent = async (eventId: number) => {
    const ok = window.confirm(
      'Möchten Sie dieses Event wirklich aktivieren?\nWenn Sie fortfahren, werden neue Registrierungen diesem Event zugeordnet.'
    );
    if (!ok) return;

    try {
      setError("");

      const updates = events.map((ev) =>
        fetch(`/api/events/${ev.id}`, {
          method: "PUT",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            isActive: ev.id === eventId,
          }),
        })
      );

      const results = await Promise.all(updates);

      const bad = results.find((r) => !r.ok);
      if (bad) {
        const txt = await bad.text().catch(() => "");
        throw new Error(`Failed to activate (${bad.status}) ${txt}`);
      }

      await loadEvents();
    } catch (e: any) {
      setError(e?.message || "Failed to activate event");
    }
  };

  async function deleteEvent(eventId: number, isActive: boolean) {
  if (isActive) {
    alert("Das aktive Event kann nicht gelöscht werden.");
    return;
  }

  const ok = window.confirm(
    "Möchten Sie dieses Event wirklich löschen?\nDiese Aktion kann nicht rückgängig gemacht werden."
  );
  if (!ok) return;

  try {
    setError("");

    const res = await fetch(`/api/events/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Delete failed (${res.status}) ${txt}`);
    }

    await loadEvents();
  } catch (e: any) {
    setError(e?.message || "Failed to delete event");
  }
}

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <div className="nav-left">
          <span className="logo">SMP 2026</span>
        </div>

        <div className="nav-right">
          <Link to="/ohomepage" className="back-btn">
            ← Dashboard
          </Link>
          <Link to="/login" className="logout-btn">
            Logout
          </Link>
        </div>
      </header>

      <main className="events-container">
        <h1>My Events</h1>

        <div className="disclaimer-box">
          <div className="disclaimer-title">Hinweis</div>
          <div className="disclaimer-text">
            Diese Seite dient ausschließlich dazu, das aktive Event zu ändern.
            Wenn das aktive Event geändert wird, registrieren sich Schüler*innen
            immer für das aktuell aktive Event. Wenn Sie Informationen zu alten
            Events sehen möchten, gehen Sie bitte zu <b>Archive</b>.
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="events-actions">
          <button className="primary-btn" onClick={openCreate}>
            Neues Event erstellen
          </button>
        </div>

        {loading ? (
          <div className="muted">Loading…</div>
        ) : events.length === 0 ? (
          <div className="muted">Keine Events gefunden.</div>
        ) : (
          <div className="events-list">
            {events.map((ev) => (
              <div key={ev.id} className="event-card">
                <div className="event-title-row">
                  <div className="event-title">{ev.title}</div>
                  {ev.isActive ? <span className="badge-active">AKTIV</span> : null}
                </div>

                {(ev.description || ev.startDate || ev.endDate) && (
                  <div className="event-meta">
                    {ev.description ? <div className="event-desc">{ev.description}</div> : null}
                    <div className="event-dates">
                      {ev.startDate ? `Start: ${toDateInputValue(ev.startDate)}` : "Start: —"}{" "}
                      |{" "}
                      {ev.endDate ? `Ende: ${toDateInputValue(ev.endDate)}` : "Ende: —"}
                    </div>
                  </div>
                )}

                <div className="event-buttons">
                  <button className="secondary-btn" onClick={() => openEdit(ev)}>
                    Bearbeiten
                  </button>

                  <button
                    className="danger-btn"
                    onClick={() => deleteEvent(ev.id, ev.isActive)}
                    disabled={ev.isActive}
                    title={ev.isActive ? "Aktives Event kann nicht gelöscht werden" : "Event löschen"}
                    >
                    Löschen
                </button>

                  <button
                    className="primary-btn"
                    onClick={() => setActiveEvent(ev.id)}
                    disabled={ev.isActive}
                    title={ev.isActive ? "Dieses Event ist bereits aktiv." : "Als aktiv setzen"}
                  >
                    Als aktives Event auswählen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-backdrop" onMouseDown={closeModal}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modal-title">
                {editingEvent ? "Event bearbeiten" : "Neues Event erstellen"}
              </div>

              <label className="modal-label">Titel *</label>
              <input
                className="modal-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. SMP 2027"
                autoFocus
              />

              <label className="modal-label">Beschreibung (optional)</label>
              <textarea
                className="modal-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
                rows={3}
              />

              <label className="modal-label">Startdatum (optional)</label>
              <input
                type="date"
                className="modal-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <label className="modal-label">Enddatum (optional)</label>
              <input
                type="date"
                className="modal-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <div className="modal-actions">
                <button className="secondary-btn" onClick={closeModal}>
                  Abbrechen
                </button>
                <button className="primary-btn" onClick={saveEvent}>
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}