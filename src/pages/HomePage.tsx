import "./home.css";
import { useEffect, useState } from "react";
import { getActiveEvent } from "../api/event";

export default function HomePage() {
  const [hideRegister, setHideRegister] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const headers: HeadersInit = {};
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const ev = await getActiveEvent(headers);
        const deadline = (ev as any).registrationClosesAt;

        if (deadline) {
          const t = new Date(deadline).getTime();
          setHideRegister(Date.now() > t);
        } else {
          setHideRegister(false);
        }
      } catch {
        setHideRegister(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="brand">Saturday Morning Physics 2026</div>

        <div className="nav-actions">
          <a href="/login" className="btn login">Login</a>
          {!hideRegister && (
            <a className="btn register" href="/register">Register</a>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container">
        <h1 className="title">Saturday Morning Physics 2026</h1>

        <article className="hero-card">
          <div className="hero-inner">

            <div className="hero-image">
              <img
                src="/public/saturday_morning_physics-27742_1300x0.jpg"
                alt="Saturday Morning Physics"
              />
            </div>

            <div className="hero-text">
              <h3>Das Programm für dieses Jahr ist veröffentlicht</h3>
              <p>
                Unsere Veranstaltungsreihe Saturday Morning Physics 2026 kehrt mit
                Universitätsvorträgen, Labortouren und offenen Diskussionsrunden
                zurück. Um sich anzumelden, klicken Sie bitte auf die Schaltfläche
                Register, oder wenn Sie bereits Teilnehmer*in sind, können Sie sich
                über Login einloggen.
              </p>
            </div>

          </div>
        </article>

        <section className="content">
          <h2>Programm</h2>
          <p>
            SATURDAY MORNING PHYSICS findet im diesen Wintersemester an 5 Samstagen
            von 9.00 bis 12.00 Uhr im großen Physik-Hörsaal und per Zoom statt.

          </p>
        </section>
      </main>
    </div>
  );
}