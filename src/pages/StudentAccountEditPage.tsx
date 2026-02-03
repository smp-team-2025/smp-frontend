import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AccountEditPage.css";

type Details = {
  id: number;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  addressExtra: string | null;
  zipCode: string;
  city: string;
  school: string;
  grade: string;
};

export default function AccountEditPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [details, setDetails] = useState<Details | null>(null);

  // editable fields
  const [salutation, setSalutation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [addressExtra, setAddressExtra] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        setError(null);
        setLoading(true);

        const res = await fetch("/api/users/details", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Fehler beim Laden der Daten");
        }

        const data = await res.json();


        const d: Details = (data?.registration ?? data) as Details;

        setDetails(d);

        // fill inputs
        setSalutation(d.salutation ?? "");
        setFirstName(d.firstName ?? "");
        setLastName(d.lastName ?? "");
        setStreet(d.street ?? "");
        setAddressExtra(d.addressExtra ?? "");
        setZipCode(d.zipCode ?? "");
        setCity(d.city ?? "");
      } catch (e: any) {
        setError(e?.message || "Fehler beim Laden");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg(null);

    if (!salutation || !firstName || !lastName || !street || !zipCode || !city) {
      setError("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch("/api/users/details", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salutation,
          firstName,
          lastName,
          street,
          addressExtra: addressExtra.trim() ? addressExtra.trim() : null,
          zipCode,
          city,
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(payload?.error || "Speichern fehlgeschlagen");
      }

      const updated: Details = payload as Details;
      setDetails((prev) => (prev ? { ...prev, ...updated } : prev));
      setOkMsg("✅ Änderungen gespeichert.");
    } catch (e: any) {
      setError(e?.message || "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <header className="navbar">
          <span className="logo">SMP 2026</span>
          <div className="nav-right">
            <Link to="/studenthomepage" className="back-btn">
              ← Dashboard
            </Link>
          </div>
        </header>
        <main className="container">
          <div className="box">Lade Daten...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <span className="logo">SMP 2026</span>
        <div className="nav-right">
          <Link to="/studenthomepage" className="back-btn">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="acct-container">
        <h1>Konto bearbeiten</h1>
        <p className="acct-subtitle">Du kannst nur Anrede, Name und Adresse ändern.</p>

        {error && <div className="acct-error">{error}</div>}
        {okMsg && <div className="acct-ok">{okMsg}</div>}

        {details && (
          <div className="acct-card">
            <div className="acct-readonly">
              <div><b>E-Mail:</b> {details.email}</div>
              <div><b>Schule:</b> {details.school}</div>
              <div><b>Klasse:</b> {details.grade}</div>
            </div>

            <form onSubmit={onSave} className="acct-form">
                <label className="acct-label">
                    Anrede *
                    <select
                    className="acct-input"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    required
                    >
                        <option value="">Bitte auswählen</option>
                        <option value="Herr">Herr</option>
                        <option value="Frau">Frau</option>
                        <option value="Divers">Divers</option>
                    </select>
                </label>

              <label>
                Vorname *
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </label>

              <label>
                Nachname *
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </label>

              <label>
                Straße *
                <input value={street} onChange={(e) => setStreet(e.target.value)} />
              </label>

              <label>
                Adresszusatz
                <input
                  value={addressExtra}
                  onChange={(e) => setAddressExtra(e.target.value)}
                  placeholder="z.B. c/o, Etage, Wohnung..."
                />
              </label>

              <div className="acct-grid2">
                <label>
                  PLZ *
                  <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                </label>

                <label>
                  Stadt *
                  <input value={city} onChange={(e) => setCity(e.target.value)} />
                </label>
              </div>

              <div className="acct-actions">
                <button className="acct-primary" type="submit" disabled={saving}>
                  {saving ? "Speichern..." : "Speichern"}
                </button>
                <Link className="acct-secondary" to="/studenthomepage">
                  Abbrechen
                </Link>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}