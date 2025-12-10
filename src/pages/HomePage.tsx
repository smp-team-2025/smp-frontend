import React from "react";
import "./home.css";

export default function HomePage(){
    return(
        <div>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="brand">Saturday Morning Physics 2025</div>

        <div className="nav-actions">
          <a href="/login" className="btn login">Login</a>
          <a href="/registration" className="btn register">Register</a>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container">
        <h1 className="title">Saturday Morning Physics 2025</h1>
        <div className="subtitle">???</div>

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
                Unsere Veranstaltungsreihe Saturday Morning Physics 2025 kehrt mit
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
            SATURDAY MORNING PHYSICS findet im Wintersemester 2025 an 5 Samstagen
            von 9.00 bis 12.00 Uhr im großen Physik-Hörsaal und per Zoom statt.
            Samstags sind wir, die Professor*innen und Wissenschaftler*innen der
            TU Darmstadt und der Gesellschaft für Schwerionenforschung in Darmstadt,
            frei von Lehrveranstaltungen und können uns ganz Ihnen widmen.
            Sie müssen samstags nicht in die Schule und somit können wir gemeinsam
            die aktuellen Fragen der Modernen Physik diskutieren.
          </p>
        </section>
      </main>
    </div>
    );
}