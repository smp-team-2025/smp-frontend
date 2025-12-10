import { useState} from "react";
import { userRegister, type RegistrationData } from "../api/registration";
import "./register.css"; 

export default function RegistrationPage(){
    const [formData, setFormData] = useState<RegistrationData>({
        salutation:"",
        firstName: "",
        lastName: "",
        email: "",
        confirmEmail: "",
        street: "",
        addressExtra: "",
        zipCode: "",
        city: "",
        school: "",
        grade: "",
        motivation: "",
        comments: "",
    });

    const [message, setMessage] = useState("");

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value}));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if(formData.email !== formData.confirmEmail){
            setMessage("Die E-Mail-Adressen stimmen nicht überein.");
            return;
        }
        try {
            const response = await userRegister(formData);
            setMessage("Registrierung erfolgreich! Bitte kontrollieren Sie Ihre E-Mail-Adresse.");
            console.log("Server response:", response);
        } catch (error) {
            setMessage("Registration fehlgeschlagen.");
            console.error(error);
        }
    }

    return (
        <div className="page-wrapper">
            <img className="bg-img" src="/public/saturday_morning_physics-27742_1300x0.jpg" />

        
        <div className="container">
            
        <h1>SMP – Registrierung</h1>

        <p className="intro">
            Die Registrierung umfasst zwei Schritte: Formular ausfüllen → Check →
            endgültig registrieren.
            <br />
            Erst wenn diese beiden Schritte abgeschlossen sind, ist Ihre Anmeldung
            abgeschlossen. Sie erhalten danach eine E-Mail, die die Anmeldung
            bestätigt.
        </p>

        <form onSubmit={handleSubmit}>
            {/* SECTION 1 — PERSON */}
            <div className="form-section">
            <h2>(1) Zur Person</h2>

            <label>Anrede</label>
            <select
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
            >
                <option value="">Bitte wählen</option>
                <option value="Herr">Herr</option>
                <option value="Frau">Frau</option>
                <option value="Divers">Divers</option>
            </select>

            <label>Vorname</label>
            <input
                type="text"
                placeholder="Vorname"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
            />

            <label>Nachname</label>
            <input
                type="text"
                placeholder="Nachname"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
            />

            <label>E-Mail</label>
            <input
                type="email"
                placeholder="name@beispiel.de"
                name="email"
                value={formData.email}
                onChange={handleChange}
            />

            <p className="info-text">
                Ihre Daten werden nicht an Dritte weitergegeben und nach Beendigung
                der SMP-Veranstaltung gelöscht.
            </p>
            </div>

            {/* SECTION 2 — ADDRESS */}
            <div className="form-section">
            <h2>(2) Adresse</h2>

            <label>Straße und Hausnummer</label>
            <input
                type="text"
                placeholder="Musterstr. 1"
                name="street"
                value={formData.street}
                onChange={handleChange}
            />

            <label>Adresszusatz (optional)</label>
            <input
                type="text"
                placeholder=""
                name="addressExtra"
                value={formData.addressExtra}
                onChange={handleChange}
            />

            <label>PLZ</label>
            <input
                type="text"
                placeholder="12345"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
            />

            <label>Ort</label>
            <input
                type="text"
                placeholder="Stadt"
                name="city"
                value={formData.city}
                onChange={handleChange}
            />
            </div>

            {/* SECTION 3 — CONFIRM EMAIL */}
            <div className="form-section">
            <h2>(3) Teilnahmebestätigung</h2>

            <label>E-Mail-Adresse zur Sicherheit noch einmal eingeben</label>
            <input
                type="email"
                placeholder="name@beispiel.de"
                name="confirmEmail"
                value={formData.confirmEmail}
                onChange={handleChange}
            />
            </div>

            {/* SECTION 4 — SCHOOL INFO */}
            <div className="form-section">
            <h2>(4) Schulinformationen</h2>

            <label>Schule</label>
            <select 
                name="school"
                value={formData.school}
                onChange={handleChange} 
            >
                <option value="">Schule auswählen</option>
                <option value="Melibokusschule, Alsbach-Haehnlein, Hessen">Hessen - Alsbach-Haehnlein - Melibokusschule </option>
                <option value="Albert-Schweitzer-Schule, Alsfeld, Hessen">Hessen - Alsfeld - Albert-Schweitzer-Schul </option>
                <option value="Bachgauschule, Babenhausen, Hessen">Hessen - Babenhausen - Bachgauschule</option>
                <option value="Taunusschule, Bad Camberg, Hessen">Hessen - Bad Camberg - Taunusschule
                </option><option value="Georg-Kerschensteiner-Schule Berufliche Schulen des Hochtaunuskreises, Bad Homburg, Hessen">Hessen - Bad Homburg - Georg-Kerschensteiner-Schule Berufliche Schulen des Hochtaunuskreises
                </option><option value="Humboldt-Schule, Bad Homburg, Hessen">Hessen - Bad Homburg - Humboldt-Schule
                </option><option value="Kaiserin-Friedrich-Gymnasium, Bad Homburg, Hessen">Hessen - Bad Homburg - Kaiserin-Friedrich-Gymnasium
                </option><option value="Ernst-Ludwig-Gymnasium, Bad Nauheim, Hessen">Hessen - Bad Nauheim - Ernst-Ludwig-Gymnasium
                </option><option value="Freie Waldorfschule Wetterau, Bad Nauheim, Hessen">Hessen - Bad Nauheim - Freie Waldorfschule Wetterau
                </option><option value="St. Lioba Gymnasium, Bad Nauheim, Hessen">Hessen - Bad Nauheim - St. Lioba Gymnasium
                </option><option value="Rhenanus-Schule, Bad Sooden-Allendorf, Hessen">Hessen - Bad Sooden-Allendorf - Rhenanus-Schule
                </option><option value="Georg-Buechner-Gymnasium, Bad Vilbel, Hessen">Hessen - Bad Vilbel - Georg-Buechner-Gymnasium
                </option><option value="Altes Kurfuerstliches Gymnasium, Bensheim, Hessen">Hessen - Bensheim - Altes Kurfuerstliches Gymnasium
                </option><option value="Geschwister-Scholl-Schule Kooperative Gesamtschule, Bensheim, Hessen">Hessen - Bensheim - Geschwister-Scholl-Schule Kooperative Gesamtschule
                </option><option value="Goethe-Gymnasium, Bensheim, Hessen">Hessen - Bensheim - Goethe-Gymnasium
                </option><option value="Karl Kuebel Schule Berufliches Gymnasium fuer Wirtschaft und Technik, Bensheim, Hessen">Hessen - Bensheim - Karl Kuebel Schule Berufliches Gymnasium fuer Wirtschaft und Technik
                </option><option value="Liebfrauenschule, Bensheim, Hessen">Hessen - Bensheim - Liebfrauenschule
                </option><option value="Georg-Christoph-Lichtenberg-Oberstufengymnasium, Bruchkoebel, Hessen">Hessen - Bruchkoebel - Georg-Christoph-Lichtenberg-Oberstufengymnasium
                </option><option value="Wolfgang-Ernst-Schule Gymnasium des Wetteraukreises, Buedingen, Hessen">Hessen - Buedingen - Wolfgang-Ernst-Schule Gymnasium des Wetteraukreises
                </option><option value="Weidigschule, Butzbach, Hessen">Hessen - Butzbach - Weidigschule
                </option><option value="Abendgymnasium Gymnasium fuer Berufstaetige, Darmstadt, Hessen">Hessen - Darmstadt - Abendgymnasium Gymnasium fuer Berufstaetige
                </option><option value="Alice-Eleonoren-Schule, Darmstadt, Hessen">Hessen - Darmstadt - Alice-Eleonoren-Schule
                </option><option value="Bertolt-Brecht-Schule Gymnasiale Oberstufenschule, Darmstadt, Hessen">Hessen - Darmstadt - Bertolt-Brecht-Schule Gymnasiale Oberstufenschule
                </option><option value="Edith-Stein-Schule, Darmstadt, Hessen">Hessen - Darmstadt - Edith-Stein-Schule
                </option><option value="Eleonorenschule, Darmstadt, Hessen">Hessen - Darmstadt - Eleonorenschule
                </option><option value="Erasmus-Kittler-Schule Berufliche Schule fuer Metalltechnik, Darmstadt, Hessen">Hessen - Darmstadt - Erasmus-Kittler-Schule Berufliche Schule fuer Metalltechnik
                </option><option value="Freie Comenius Schule, Darmstadt, Hessen">Hessen - Darmstadt - Freie Comenius Schule
                </option><option value="Freie Waldorfschule, Darmstadt, Hessen">Hessen - Darmstadt - Freie Waldorfschule
                </option><option value="Georg-Buechner-Schule Gymnasium, Darmstadt, Hessen">Hessen - Darmstadt - Georg-Buechner-Schule Gymnasium
                </option><option value="Gutenbergschule, Darmstadt, Hessen">Hessen - Darmstadt - Gutenbergschule
                </option><option value="Heinrich-Emanuel-Merck-Schule, Darmstadt, Hessen">Hessen - Darmstadt - Heinrich-Emanuel-Merck-Schule
                </option><option value="Hochschule Darmstadt, Darmstadt, Hessen">Hessen - Darmstadt - Hochschule Darmstadt
                </option><option value="Justus-Liebig-Schule, Darmstadt, Hessen">Hessen - Darmstadt - Justus-Liebig-Schule
                </option><option value="Lichtenbergschule Gymnasium Europaschule, Darmstadt, Hessen">Hessen - Darmstadt - Lichtenbergschule Gymnasium Europaschule
                </option><option value="Ludwig-Georgs-Gymnasium, Darmstadt, Hessen">Hessen - Darmstadt - Ludwig-Georgs-Gymnasium
                </option><option value="Martin-Behaim-Schule, Darmstadt, Hessen">Hessen - Darmstadt - Martin-Behaim-Schule
                </option><option value="Peter-Behrens-Schule, Darmstadt, Hessen">Hessen - Darmstadt - Peter-Behrens-Schule
                </option><option value="Sabine-Ball-Schule Darmstadt, Darmstadt, Hessen">Hessen - Darmstadt - Sabine-Ball-Schule Darmstadt
                </option><option value="Schulzentrum Seminar Marienhoehe Realschule, Gymnasium und Kolleg, Darmstadt, Hessen">Hessen - Darmstadt - Schulzentrum Seminar Marienhoehe Realschule, Gymnasium und Kolleg
                </option><option value="Stadtteilschule Arheilgen Kooperative Gesamtschule, Darmstadt, Hessen">Hessen - Darmstadt - Stadtteilschule Arheilgen Kooperative Gesamtschule
                </option><option value="Studienkolleg fuer auslaendische Studierende, Darmstadt, Hessen">Hessen - Darmstadt - Studienkolleg fuer auslaendische Studierende
                </option><option value="Thomas-Mann-Schule, Darmstadt, Hessen">Hessen - Darmstadt - Thomas-Mann-Schule
                </option><option value="Viktoriaschule, Darmstadt, Hessen">Hessen - Darmstadt - Viktoriaschule
                </option><option value="Alfred-Delp-Schule Oberstufengymnasium, Dieburg, Hessen">Hessen - Dieburg - Alfred-Delp-Schule Oberstufengymnasium
                </option><option value="Landrat-Gruber-Schule Berufliche Schulen des Landkreises Darmstadt - Dieburg, Dieburg, Hessen">Hessen - Dieburg - Landrat-Gruber-Schule Berufliche Schulen des Landkreises Darmstadt - Dieburg
                </option><option value="PTI Private Tagesheim und Internatsschule Dieburg, Dieburg, Hessen">Hessen - Dieburg - PTI Private Tagesheim und Internatsschule Dieburg
                </option><option value="Heinrich-Mann-Schule, Dietzenbach, Hessen">Hessen - Dietzenbach - Heinrich-Mann-Schule
                </option><option value="Rudolf-Steiner-Schule, Dietzenbach, Hessen">Hessen - Dietzenbach - Rudolf-Steiner-Schule
                </option><option value="Max-Eyth-Schule Berufliches Zentrum des Kreises Offenbach, Dreieich, Hessen">Hessen - Dreieich - Max-Eyth-Schule Berufliches Zentrum des Kreises Offenbach
                </option><option value="Ricarda-Huch-Schule, Dreieich, Hessen">Hessen - Dreieich - Ricarda-Huch-Schule
                </option><option value="Strothoff International School, Dreieich, Hessen">Hessen - Dreieich - Strothoff International School
                </option><option value="Weibelfeld-Gesamtschule, Dreieich, Hessen">Hessen - Dreieich - Weibelfeld-Gesamtschule
                </option><option value="Hermann-Staudinger-Gymnasium, Erlenbach, Hessen">Hessen - Erlenbach - Hermann-Staudinger-Gymnasium
                </option><option value="Heinrich-von-Kleist-Schule, Eschborn, Hessen">Hessen - Eschborn - Heinrich-von-Kleist-Schule
                </option><option value="Graf-Stauffenberg-Schule, Floersheim, Hessen">Hessen - Floersheim - Graf-Stauffenberg-Schule
                </option><option value="Abendgymnasium I, Frankfurt, Hessen">Hessen - Frankfurt - Abendgymnasium I
                </option><option value="Abendgymnasium II, Frankfurt, Hessen">Hessen - Frankfurt - Abendgymnasium II
                </option><option value="Albrecht-Duerer-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Albrecht-Duerer-Schule
                </option><option value="Anna-Schmidt-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Anna-Schmidt-Schule
                </option><option value="Bettinaschule, Frankfurt, Hessen">Hessen - Frankfurt - Bettinaschule
                </option><option value="Bildungszentrum Hermann Hesse, Frankfurt, Hessen">Hessen - Frankfurt - Bildungszentrum Hermann Hesse
                </option><option value="Carl-Schurz-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Carl-Schurz-Schule
                </option><option value="Carl-von-Weinberg-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Carl-von-Weinberg-Schule
                </option><option value="Elisabethenschule, Frankfurt, Hessen">Hessen - Frankfurt - Elisabethenschule
                </option><option value="Ernst-Reuter-Schule I Gymnasium, Frankfurt, Hessen">Hessen - Frankfurt - Ernst-Reuter-Schule I Gymnasium
                </option><option value="Europaeische Schule Frankfurt am Main, Frankfurt, Hessen">Hessen - Frankfurt - Europaeische Schule Frankfurt am Main
                </option><option value="Freie Christliche Schule Frankfurt Grundschule-Realschule-Gymnasium, Frankfurt, Hessen">Hessen - Frankfurt - Freie Christliche Schule Frankfurt Grundschule-Realschule-Gymnasium
                </option><option value="Freie Waldorfschule, Frankfurt, Hessen">Hessen - Frankfurt - Freie Waldorfschule
                </option><option value="Freiherr-vom-Stein-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Freiherr-vom-Stein-Schule
                </option><option value="Friedrich-Dessauer-Gymnasium, Frankfurt, Hessen">Hessen - Frankfurt - Friedrich-Dessauer-Gymnasium
                </option><option value="Goethe-Gymnasium, Frankfurt, Hessen">Hessen - Frankfurt - Goethe-Gymnasium
                </option><option value="Griechische Schule, Frankfurt, Hessen">Hessen - Frankfurt - Griechische Schule
                </option><option value="Gymnasium Nord, Frankfurt, Hessen">Hessen - Frankfurt - Gymnasium Nord
                </option><option value="Gymnasium Riedberg, Frankfurt, Hessen">Hessen - Frankfurt - Gymnasium Riedberg
                </option><option value="Heinrich-Kleyer-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Heinrich-Kleyer-Schule
                </option><option value="Heinrich-von-Gagern-Gymnasium, Frankfurt, Hessen">Hessen - Frankfurt - Heinrich-von-Gagern-Gymnasium
                </option><option value="Heinrich-von-Stephan-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Heinrich-von-Stephan-Schule
                </option><option value="Helene-Lange-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Helene-Lange-Schule
                </option><option value="Helmholtz-Schule Gymnasium, Frankfurt, Hessen">Hessen - Frankfurt - Helmholtz-Schule Gymnasium
                </option><option value="Herderschule, Frankfurt, Hessen">Hessen - Frankfurt - Herderschule
                </option><option value="Hessenkolleg Frankfurt, Frankfurt, Hessen">Hessen - Frankfurt - Hessenkolleg Frankfurt
                </option><option value="Internationale Schule Frankfurt-Rhein-Main Gymnasium, Frankfurt, Hessen">Hessen - Frankfurt - Internationale Schule Frankfurt-Rhein-Main Gymnasium
                </option><option value="Japanische Internationale Schule Frankfurt, Frankfurt, Hessen">Hessen - Frankfurt - Japanische Internationale Schule Frankfurt
                </option><option value="Klingerschule, Frankfurt, Hessen">Hessen - Frankfurt - Klingerschule
                </option><option value="Leibnizschule, Frankfurt, Hessen">Hessen - Frankfurt - Leibnizschule
                </option><option value="Lessing-Gymnasium, Frankfurt, Hessen">Hessen - Frankfurt - Lessing-Gymnasium
                </option><option value="Liebigschule, Frankfurt, Hessen">Hessen - Frankfurt - Liebigschule
                </option><option value="Ludwig-Erhard-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Ludwig-Erhard-Schule
                </option><option value="Max-Beckmann-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Max-Beckmann-Schule
                </option><option value="Musterschule, Frankfurt, Hessen">Hessen - Frankfurt - Musterschule
                </option><option value="Otto-Hahn-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Otto-Hahn-Schule
                </option><option value="Paul-Ehrlich-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Paul-Ehrlich-Schule
                </option><option value="Private Kantschule, Frankfurt, Hessen">Hessen - Frankfurt - Private Kantschule
                </option><option value="Schillerschule, Frankfurt, Hessen">Hessen - Frankfurt - Schillerschule
                </option><option value="Schule am Landgraben, Frankfurt, Hessen">Hessen - Frankfurt - Schule am Landgraben
                </option><option value="Schule am Ried, Frankfurt, Hessen">Hessen - Frankfurt - Schule am Ried
                </option><option value="Schule der islamischen Republik Iran, Frankfurt, Hessen">Hessen - Frankfurt - Schule der islamischen Republik Iran
                </option><option value="Frankfurter Schule fŸr Bekleidung und Mode, Frankfurt, Hessen">Hessen - Frankfurt - Frankfurter Schule fŸr Bekleidung und Mode
                </option><option value="Stauffenbergschule, Frankfurt, Hessen">Hessen - Frankfurt - Stauffenbergschule
                </option><option value="Victor-Hugo-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Victor-Hugo-Schule
                </option><option value="Werner-von-Siemens-Schule, Frankfurt, Hessen">Hessen - Frankfurt - Werner-von-Siemens-Schule
                </option><option value="Wilhelm-Merton-Schule Berufliche Schule, Frankfurt, Hessen">Hessen - Frankfurt - Wilhelm-Merton-Schule Berufliche Schule
                </option><option value="Woehlerschule, Frankfurt, Hessen">Hessen - Frankfurt - Woehlerschule
                </option><option value="Ziehenschule Gymnasium - Europaschule, Frankfurt, Hessen">Hessen - Frankfurt - Ziehenschule Gymnasium - Europaschule
                </option><option value="Kopernikusschule Freigericht schulformbezogene Gesamtschule mit gymnasialer Oberstufe, Freigericht, Hessen">Hessen - Freigericht - Kopernikusschule Freigericht schulformbezogene Gesamtschule mit gymnasialer Oberstufe
                </option><option value="Augustinerschule, Friedberg, Hessen">Hessen - Friedberg - Augustinerschule
                </option><option value="Burggymnasium, Friedberg, Hessen">Hessen - Friedberg - Burggymnasium
                </option><option value="Johann-Philipp-Reis-Schule Berufliches Gymnasium, Friedberg, Hessen">Hessen - Friedberg - Johann-Philipp-Reis-Schule Berufliches Gymnasium
                </option><option value="Philipp-Reis-Schule, Friedrichsdorf, Hessen">Hessen - Friedrichsdorf - Philipp-Reis-Schule
                </option><option value="Koenig-Heinrich-Schule Gymnasium des Schwalm-Eder-Kreises, Fritzlar, Hessen">Hessen - Fritzlar - Koenig-Heinrich-Schule Gymnasium des Schwalm-Eder-Kreises
                </option><option value="Ferdinand-Braun-Schule Berufliches Gymnasium, Fulda, Hessen">Hessen - Fulda - Ferdinand-Braun-Schule Berufliches Gymnasium
                </option><option value="Rheingau Gymnasium, Geisenheim, Hessen">Hessen - Geisenheim - Rheingau Gymnasium
                </option><option value="St. Ursula-Schule, Geisenheim, Hessen">Hessen - Geisenheim - St. Ursula-Schule
                </option><option value="Grimmelshausenschule, Gelnhausen, Hessen">Hessen - Gelnhausen - Grimmelshausenschule
                </option><option value="Gymnasium Gernsheim, Gernsheim, Hessen">Hessen - Gernsheim - Gymnasium Gernsheim
                </option><option value="Johannes-Gutenberg Schule, Gernsheim, Hessen">Hessen - Gernsheim - Johannes-Gutenberg Schule
                </option><option value="Gerhard-Hauptmann-Schule, Griesheim, Hessen">Hessen - Griesheim - Gerhard-Hauptmann-Schule
                </option><option value="Albert-Einstein-Schule Kooperative Gesamtschule mit gymnasialer Oberstufe, Gross-Bieberau, Hessen">Hessen - Gross-Bieberau - Albert-Einstein-Schule Kooperative Gesamtschule mit gymnasialer Oberstufe
                </option><option value="Berufliche Schulen des Kreises Gross-Gerau, Gross-Gerau, Hessen">Hessen - Gross-Gerau - Berufliche Schulen des Kreises Gross-Gerau
                </option><option value="Martin-Buber-Schule, Gross-Gerau, Hessen">Hessen - Gross-Gerau - Martin-Buber-Schule
                </option><option value="Luise Buechner Schule, Gross-Gerau, Hessen">Hessen - Gross-Gerau - Luise Buechner Schule
                </option><option value="Praelat-Diehl-Schule, Gross-Gerau, Hessen">Hessen - Gross-Gerau - Praelat-Diehl-Schule
                </option><option value="Max-Planck-Schule, Gross-Umstadt, Hessen">Hessen - Gross-Umstadt - Max-Planck-Schule
                </option><option value="Franziskanergymnasium Kreuzburg, Grosskrotzenburg, Hessen">Hessen - Grosskrotzenburg - Franziskanergymnasium Kreuzburg
                </option><option value="Leiniger-Gymnasium, Gruenstadt, Hessen">Hessen - Gruenstadt - Leiniger-Gymnasium
                </option><option value="Fuerst-Johann-Ludwig-Schule Gesamtschule des Kreises Limburg-Weilburg, Hadamar, Hessen">Hessen - Hadamar - Fuerst-Johann-Ludwig-Schule Gesamtschule des Kreises Limburg-Weilburg
                </option><option value="Hohe Landesschule, Hanau, Hessen">Hessen - Hanau - Hohe Landesschule
                </option><option value="Karl-Rehbein-Schule, Hanau, Hessen">Hessen - Hanau - Karl-Rehbein-Schule
                </option><option value="Kaufmaennische Schulen II Berufliches Gymnasium, Hanau, Hessen">Hessen - Hanau - Kaufmaennische Schulen II Berufliches Gymnasium
                </option><option value="Lindenauschule Integrierte Gesamtschule, Hanau, Hessen">Hessen - Hanau - Lindenauschule Integrierte Gesamtschule
                </option><option value="Ludwig-Geissler-Schule, Hanau, Hessen">Hessen - Hanau - Ludwig-Geissler-Schule
                </option><option value="Otto-Hahn-Schule, Hanau, Hessen">Hessen - Hanau - Otto-Hahn-Schule
                </option><option value="Heinrich-Boell-Schule Kooperative Gesamtschule mit gymnasialer Oberstufe, Hattersheim, Hessen">Hessen - Hattersheim - Heinrich-Boell-Schule Kooperative Gesamtschule mit gymnasialer Oberstufe
                </option><option value="Abendgymnasium des Kreises Bergstrasse, Heppenheim, Hessen">Hessen - Heppenheim - Abendgymnasium des Kreises Bergstrasse
                </option><option value="Odenwaldschule, Heppenheim, Hessen">Hessen - Heppenheim - Odenwaldschule
                </option><option value="Starkenburg-Gymnasium Gymnasium des Kreises Bergstrasse, Heppenheim, Hessen">Hessen - Heppenheim - Starkenburg-Gymnasium Gymnasium des Kreises Bergstrasse
                </option><option value="Adolf-Reichwein-Gymnasium Gymnasium des Kreises Offenbach, Heusenstamm, Hessen">Hessen - Heusenstamm - Adolf-Reichwein-Gymnasium Gymnasium des Kreises Offenbach
                </option><option value="Heinrich-von-Brentano-Schule, Hochheim, Hessen">Hessen - Hochheim - Heinrich-von-Brentano-Schule
                </option><option value="Ernst-Goebel-Schule Schulformbezogene Gesamtschule des Odenwaldkreises, Hoechst, Hessen">Hessen - Hoechst - Ernst-Goebel-Schule Schulformbezogene Gesamtschule des Odenwaldkreises
                </option><option value="Bruehlwiesenschule, Hofheim, Hessen">Hessen - Hofheim - Bruehlwiesenschule
                </option><option value="Main-Taunus-Schule, Hofheim, Hessen">Hessen - Hofheim - Main-Taunus-Schule
                </option><option value="Freiherr-vom-Stein-Schule, Huenfelden, Hessen">Hessen - Huenfelden - Freiherr-vom-Stein-Schule
                </option><option value="Pestalozzischule, Idstein, Hessen">Hessen - Idstein - Pestalozzischule
                </option><option value="Kurt-Schumacher-Schule, Karben, Hessen">Hessen - Karben - Kurt-Schumacher-Schule
                </option><option value="Max-Eyth-Schule Berufliches Gymnasium, Kassel, Hessen">Hessen - Kassel - Max-Eyth-Schule Berufliches Gymnasium
                </option><option value="Oskar-von-Miller-Schule, Kassel, Hessen">Hessen - Kassel - Oskar-von-Miller-Schule
                </option><option value="Eichendorffschule Gesamtschule des Main-Taunus-Kreises mit Gymn. Oberstufe Immanuael Kant, Kelkheim, Hessen">Hessen - Kelkheim - Eichendorffschule Gesamtschule des Main-Taunus-Kreises mit Gymn. Oberstufe Immanuael Kant
                </option><option value="Immanuel-Kant-Schule Gymnasiale Oberstufe, Kelkheim, Hessen">Hessen - Kelkheim - Immanuel-Kant-Schule Gymnasiale Oberstufe
                </option><option value="Privatgymnasium Dr. Richter, Kelkheim, Hessen">Hessen - Kelkheim - Privatgymnasium Dr. Richter
                </option><option value="Bischof-Neumann-Schule Privatschule, Koenigstein, Hessen">Hessen - Koenigstein - Bischof-Neumann-Schule Privatschule
                </option><option value="St. Angela-Schule Privatschule, Koenigstein, Hessen">Hessen - Koenigstein - St. Angela-Schule Privatschule
                </option><option value="Taunusgymnasium, Koenigstein, Hessen">Hessen - Koenigstein - Taunusgymnasium
                </option><option value="Altkoenigschule Gesamtschule, Kronberg, Hessen">Hessen - Kronberg - Altkoenigschule Gesamtschule
                </option><option value="Berufliche Schulen des Kreises Bergstrasse, Lampertheim, Hessen">Hessen - Lampertheim - Berufliche Schulen des Kreises Bergstrasse
                </option><option value="Lessing-Gymnasium, Lampertheim, Hessen">Hessen - Lampertheim - Lessing-Gymnasium
                </option><option value="Privates Litauisches Gymnasium, Lampertheim, Hessen">Hessen - Lampertheim - Privates Litauisches Gymnasium
                </option><option value="Adolf-Reichwein-Schule, Langen, Hessen">Hessen - Langen - Adolf-Reichwein-Schule
                </option><option value="Dreieichgymnasium, Langen, Hessen">Hessen - Langen - Dreieichgymnasium
                </option><option value="Adolf-Reichwein Schule, Limburg, Hessen">Hessen - Limburg - Adolf-Reichwein Schule
                </option><option value="Friedrich-Dessauer-Schule, Limburg, Hessen">Hessen - Limburg - Friedrich-Dessauer-Schule
                </option><option value="Private Marienschule, Limburg, Hessen">Hessen - Limburg - Private Marienschule
                </option><option value="Tilemannschule Gymnasium und altsprachliches Gymnasium, Limburg, Hessen">Hessen - Limburg - Tilemannschule Gymnasium und altsprachliches Gymnasium
                </option><option value="Albert-Einstein-Schule, Maintal, Hessen">Hessen - Maintal - Albert-Einstein-Schule
                </option><option value="Adolf-Reichwein-Schule Berufliches Gymnasium, Marburg, Hessen">Hessen - Marburg - Adolf-Reichwein-Schule Berufliches Gymnasium
                </option><option value="Berufliche Schulen des Odenwaldkreises, Michelstadt, Hessen">Hessen - Michelstadt - Berufliche Schulen des Odenwaldkreises
                </option><option value="Gymnasium Michelstadt, Michelstadt, Hessen">Hessen - Michelstadt - Gymnasium Michelstadt
                </option><option value="Bertha-von-Suttner-Schule Integrierte Gesamtschule mit gymnasialer Oberstufe, Moerfelden, Hessen">Hessen - Moerfelden - Bertha-von-Suttner-Schule Integrierte Gesamtschule mit gymnasialer Oberstufe
                </option><option value="Friedrich-Ebert-Gymnasium des Kreises Offenbach, Muehlheim, Hessen">Hessen - Muehlheim - Friedrich-Ebert-Gymnasium des Kreises Offenbach
                </option><option value="Abendgymnasium, Neu-Isenburg, Hessen">Hessen - Neu-Isenburg - Abendgymnasium
                </option><option value="Brueder-Grimm-Schule Gesamtschule mit Gymnasialzweig, Neu-Isenburg, Hessen">Hessen - Neu-Isenburg - Brueder-Grimm-Schule Gesamtschule mit Gymnasialzweig
                </option><option value="Goetheschule Gymnasium des Kreises Offenbach, Neu-Isenburg, Hessen">Hessen - Neu-Isenburg - Goetheschule Gymnasium des Kreises Offenbach
                </option><option value="Gymnasium Nidda, Nidda, Hessen">Hessen - Nidda - Gymnasium Nidda
                </option><option value="Georg-Christoph-Lichtenberg-Schule, Ober-Ramstadt, Hessen">Hessen - Ober-Ramstadt - Georg-Christoph-Lichtenberg-Schule
                </option><option value="Georg-Kerschensteiner-Schule Berufliches Gymnasium, Obertshausen, Hessen">Hessen - Obertshausen - Georg-Kerschensteiner-Schule Berufliches Gymnasium
                </option><option value="Feldbergschule, Oberursel, Hessen">Hessen - Oberursel - Feldbergschule
                </option><option value="Gymnasium Oberursel, Oberursel, Hessen">Hessen - Oberursel - Gymnasium Oberursel
                </option><option value="Hochtaunusschule Berufliche Schule des Hochtaunuskreises, Oberursel, Hessen">Hessen - Oberursel - Hochtaunusschule Berufliche Schule des Hochtaunuskreises
                </option><option value="Abendgymnasium fuer Berufstaetige, Offenbach, Hessen">Hessen - Offenbach - Abendgymnasium fuer Berufstaetige
                </option><option value="Albert-Schweitzer-Schule, Offenbach, Hessen">Hessen - Offenbach - Albert-Schweitzer-Schule
                </option><option value="August-Bebel-Schule, Offenbach, Hessen">Hessen - Offenbach - August-Bebel-Schule
                </option><option value="Gewerblich-Technische-Schulen der Stadt Offenbach, Offenbach, Hessen">Hessen - Offenbach - Gewerblich-Technische-Schulen der Stadt Offenbach
                </option><option value="Hochschule fuer Gestaltung, Offenbach, Hessen">Hessen - Offenbach - Hochschule fuer Gestaltung
                </option><option value="Leibnizschule Gymnasium der Stadt Offenbach, Offenbach, Hessen">Hessen - Offenbach - Leibnizschule Gymnasium der Stadt Offenbach
                </option><option value="Marienschule, Offenbach, Hessen">Hessen - Offenbach - Marienschule
                </option><option value="Oswald von Nell-Breuning Schule II, Offenbach, Hessen">Hessen - Offenbach - Oswald von Nell-Breuning Schule II
                </option><option value="Rudolf-Koch-Schule Gymnasium, Offenbach, Hessen">Hessen - Offenbach - Rudolf-Koch-Schule Gymnasium
                </option><option value="Theodor-Heuss-Schule, Offenbach, Hessen">Hessen - Offenbach - Theodor-Heuss-Schule
                </option><option value="Gesamtschule Konradsdorf, Ortenberg, Hessen">Hessen - Ortenberg - Gesamtschule Konradsdorf
                </option><option value="Otzbergschule, Lengfeld Otzberg, Hessen">Hessen - Lengfeld Otzberg - Otzbergschule
                </option><option value="Friedrich-Ebert-Schule Gymnasiale Oberstufe im Schulteil Lessingschule, Pfungstadt, Hessen">Hessen - Pfungstadt - Friedrich-Ebert-Schule Gymnasiale Oberstufe im Schulteil Lessingschule
                </option><option value="Anne-Frank-Schule, Raunheim, Hessen">Hessen - Raunheim - Anne-Frank-Schule
                </option><option value="Georg-August-Zinn-Schule Gesamtschule des Odenwaldkreises, Reichelsheim, Hessen">Hessen - Reichelsheim - Georg-August-Zinn-Schule Gesamtschule des Odenwaldkreises
                </option><option value="Martin-Luther-Schule, Rimbach, Hessen">Hessen - Rimbach - Martin-Luther-Schule
                </option><option value="Nell-Breuning-Schule Integrierte Gesamtschule, Europaschule, Gymnasiale Oberstufe, Roedermark, Hessen">Hessen - Roedermark - Nell-Breuning-Schule Integrierte Gesamtschule, Europaschule, Gymnasiale Oberstufe
                </option><option value="Claus-von-Stauffenberg-Schule Gymnasiale Oberstufe, Rodgau, Hessen">Hessen - Rodgau - Claus-von-Stauffenberg-Schule Gymnasiale Oberstufe
                </option><option value="Georg-Buechner-Schule, Rodgau, Hessen">Hessen - Rodgau - Georg-Buechner-Schule
                </option><option value="Geschwister-Scholl-Schule, Rodgau, Hessen">Hessen - Rodgau - Geschwister-Scholl-Schule
                </option><option value="Justin-Wagner-Schule, Rossdorf, Hessen">Hessen - Rossdorf - Justin-Wagner-Schule
                </option><option value="Gustav-Heinemann-Schule, Ruesselsheim, Hessen">Hessen - Ruesselsheim - Gustav-Heinemann-Schule
                </option><option value="Hessenkolleg, Ruesselsheim, Hessen">Hessen - Ruesselsheim - Hessenkolleg
                </option><option value="Immanuel-Kant-Schule Gymnasium, Ruesselsheim, Hessen">Hessen - Ruesselsheim - Immanuel-Kant-Schule Gymnasium
                </option><option value="Max-Planck-Schule Gymnasium, Ruesselsheim, Hessen">Hessen - Ruesselsheim - Max-Planck-Schule Gymnasium
                </option><option value="Werner-Heisenberg-Schule, Ruesselsheim, Hessen">Hessen - Ruesselsheim - Werner-Heisenberg-Schule
                </option><option value="Ulrich-von-Hutten-Gymnasium, Schluechtern, Hessen">Hessen - Schluechtern - Ulrich-von-Hutten-Gymnasium
                </option><option value="Albert-Einstein-Schule, Schwalbach, Hessen">Hessen - Schwalbach - Albert-Einstein-Schule
                </option><option value="Schuldorf Bergstrasse Gesamtschule des Kreises Darmstadt-Dieburg Gymnasialer Zweig, Seeheim-Jugenheim, Hessen">Hessen - Seeheim-Jugenheim - Schuldorf Bergstrasse Gesamtschule des Kreises Darmstadt-Dieburg Gymnasialer Zweig
                </option><option value="Einhardschule Gesamtschule mit gymnasialer Oberstufe, Seligenstadt, Hessen">Hessen - Seligenstadt - Einhardschule Gesamtschule mit gymnasialer Oberstufe
                </option><option value="Gesamtschule Obere Aar,Taunusstein,Hessen ">Hessen - Taunusstein - Gesamtschule "Obere Aar"
                </option><option value="Gymnasium Taunusstein, Taunusstein, Hessen">Hessen - Taunusstein - Gymnasium Taunusstein
                </option><option value="Christian-Wirth-Schule, Usingen, Hessen">Hessen - Usingen - Christian-Wirth-Schule
                </option><option value="Albertus-Magnus-Schule, Viernheim, Hessen">Hessen - Viernheim - Albertus-Magnus-Schule
                </option><option value="Alexander-von-Humboldt-Schule, Viernheim, Hessen">Hessen - Viernheim - Alexander-von-Humboldt-Schule
                </option><option value="Ueberwald-Gymnasium, Wald-Michelbach, Hessen">Hessen - Wald-Michelbach - Ueberwald-Gymnasium
                </option><option value="Albrecht-Duerer-Schule Gesamtschule mit Oberstufe, Weiterstadt, Hessen">Hessen - Weiterstadt - Albrecht-Duerer-Schule Gesamtschule mit Oberstufe
                </option><option value="Hessenkolleg Wetzlar, Wetzlar, Hessen">Hessen - Wetzlar - Hessenkolleg Wetzlar
                </option><option value="Werner-von-Siemens-Schule Berufliches Gymnasium, Wetzlar, Hessen">Hessen - Wetzlar - Werner-von-Siemens-Schule Berufliches Gymnasium
                </option><option value="Abendgymnasium Friedrich-List-Schule, Wiesbaden, Hessen">Hessen - Wiesbaden - Abendgymnasium Friedrich-List-Schule
                </option><option value="Carl-von-Ossietzky-Schule Oberstufengymnasium, Wiesbaden, Hessen">Hessen - Wiesbaden - Carl-von-Ossietzky-Schule Oberstufengymnasium
                </option><option value="Dilthey-Schule Gymnasium, Wiesbaden, Hessen">Hessen - Wiesbaden - Dilthey-Schule Gymnasium
                </option><option value="Elly-Heuss-Schule, Wiesbaden, Hessen">Hessen - Wiesbaden - Elly-Heuss-Schule
                </option><option value="Freie Waldorfschule, Wiesbaden, Hessen">Hessen - Wiesbaden - Freie Waldorfschule
                </option><option value="Friedrich-Ebert-Schule Berufliche Schule, Wiesbaden, Hessen">Hessen - Wiesbaden - Friedrich-Ebert-Schule Berufliche Schule
                </option><option value="Friedrich-List-Schule Berufliche Schulen, Wiesbaden, Hessen">Hessen - Wiesbaden - Friedrich-List-Schule Berufliche Schulen
                </option><option value="Gutenbergschule, Wiesbaden, Hessen">Hessen - Wiesbaden - Gutenbergschule
                </option><option value="Gymnasium am Mosbacher Berg, Wiesbaden, Hessen">Hessen - Wiesbaden - Gymnasium am Mosbacher Berg
                </option><option value="Hessenkolleg Wiesbaden, Wiesbaden, Hessen">Hessen - Wiesbaden - Hessenkolleg Wiesbaden
                </option><option value="Humboldt-Schule Privates Gymnasium, Wiesbaden, Hessen">Hessen - Wiesbaden - Humboldt-Schule Privates Gymnasium
                </option><option value="Kerschensteinerschule, Wiesbaden, Hessen">Hessen - Wiesbaden - Kerschensteinerschule
                </option><option value="Leibnizschule, Wiesbaden, Hessen">Hessen - Wiesbaden - Leibnizschule
                </option><option value="Martin-Niemoeller-Schule Oberstufengymnasium, Wiesbaden, Hessen">Hessen - Wiesbaden - Martin-Niemoeller-Schule Oberstufengymnasium
                </option><option value="Oranienschule, Wiesbaden, Hessen">Hessen - Wiesbaden - Oranienschule
                </option><option value="Theodor-Fliedner-Schule, Wiesbaden, Hessen">Hessen - Wiesbaden - Theodor-Fliedner-Schule
                </option><option value="Gymnasium Bammental, Bammental, Baden Wuerttemberg">Baden Wuerttemberg - Bammental - Gymnasium Bammental
                </option><option value="Zabergaeu-Gymnasium, Brackenheim, Baden Wuerttemberg">Baden Wuerttemberg - Brackenheim - Zabergaeu-Gymnasium
                </option><option value="Hohenstaufen-Gymnasium, Eberbach, Baden Wuerttemberg">Baden Wuerttemberg - Eberbach - Hohenstaufen-Gymnasium
                </option><option value="Dietrich-Bonhoeffer-Gymnasium, Eppelheim, Baden Wuerttemberg">Baden Wuerttemberg - Eppelheim - Dietrich-Bonhoeffer-Gymnasium
                </option><option value="Abendgymnasium, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Abendgymnasium
                </option><option value="Bunsen-Gymnasium, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Bunsen-Gymnasium
                </option><option value="Elisabeth-von-Thadden-Schule, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Elisabeth-von-Thadden-Schule
                </option><option value="Englisches Institut, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Englisches Institut
                </option><option value="Freie Waldorfschule, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Freie Waldorfschule
                </option><option value="Heidelberg College, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Heidelberg College
                </option><option value="Helmholtz-Gymnasium, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Helmholtz-Gymnasium
                </option><option value="Hoelderlin-Gymnasium, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Hoelderlin-Gymnasium
                </option><option value="Internationale Gesamtschule Heidelberg unesco-projekt-schule, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Internationale Gesamtschule Heidelberg unesco-projekt-schule
                </option><option value="Johannes-Gutenberg-Schule, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Johannes-Gutenberg-Schule
                </option><option value="Kurfuerst-Friedrich-Gymnasium, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Kurfuerst-Friedrich-Gymnasium
                </option><option value="St. Raphael-Gymnasium, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - St. Raphael-Gymnasium
                </option><option value="Technisches Gymnasium an der Carl-Bosch-Schule, Heidelberg, Baden Wuerttemberg">Baden Wuerttemberg - Heidelberg - Technisches Gymnasium an der Carl-Bosch-Schule
                </option><option value="Andreas-Schneider-Schule, Heilbronn, Baden Wuerttemberg">Baden Wuerttemberg - Heilbronn - Andreas-Schneider-Schule
                </option><option value="Elly-Heuss-Knapp-Gymnasium, Heilbronn, Baden Wuerttemberg">Baden Wuerttemberg - Heilbronn - Elly-Heuss-Knapp-Gymnasium
                </option><option value="Justinus-Kerner-Gymnasium, Heilbronn, Baden Wuerttemberg">Baden Wuerttemberg - Heilbronn - Justinus-Kerner-Gymnasium
                </option><option value="Theodor-Heuss-Gymnasium, Heilbronn, Baden Wuerttemberg">Baden Wuerttemberg - Heilbronn - Theodor-Heuss-Gymnasium
                </option><option value="Gymnasium Hemsbach, Hemsbach, Baden Wuerttemberg">Baden Wuerttemberg - Hemsbach - Gymnasium Hemsbach
                </option><option value="Lise-Meitner-Gymnasium, Koenigsbach-Stein, Baden Wuerttemberg">Baden Wuerttemberg - Koenigsbach-Stein - Lise-Meitner-Gymnasium
                </option><option value="Carl-Benz-Gymnasium, Ladenburg, Baden Wuerttemberg">Baden Wuerttemberg - Ladenburg - Carl-Benz-Gymnasium
                </option><option value="Abendgymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Abendgymnasium
                </option><option value="Carl-Benz-Schule, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Carl-Benz-Schule
                </option><option value="Elisabeth-Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Elisabeth-Gymnasium
                </option><option value="Feudenheim-Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Feudenheim-Gymnasium
                </option><option value="Freie Waldorfschule, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Freie Waldorfschule
                </option><option value="Geschwister-Scholl-Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Geschwister-Scholl-Gymnasium
                </option><option value="Hochschule Mannheim, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Hochschule Mannheim
                </option><option value="Integrierte Gesamtschule Mannheim - Herzogenried, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Integrierte Gesamtschule Mannheim - Herzogenried
                </option><option value="Johann-Sebastian-Bach-Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Johann-Sebastian-Bach-Gymnasium
                </option><option value="Johanna Geissmar Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Johanna Geissmar Gymnasium
                </option><option value="Karl-Friedrich-Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Karl-Friedrich-Gymnasium
                </option><option value="Kurpfalz-Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Kurpfalz-Gymnasium
                </option><option value="Lessing-Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Lessing-Gymnasium
                </option><option value="Liselotte-Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Liselotte-Gymnasium
                </option><option value="Ludwig-Frank-Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Ludwig-Frank-Gymnasium
                </option><option value="Moll-Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Moll-Gymnasium
                </option><option value="Peter-Petersen-Gymnasium, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Peter-Petersen-Gymnasium
                </option><option value="Ursulinenschule, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Ursulinenschule
                </option><option value="Werner-von-Siemens-Schule, Mannheim, Baden Wuerttemberg">Baden Wuerttemberg - Mannheim - Werner-von-Siemens-Schule
                </option><option value="Gymnasium Neckargemuend, Neckargemuend, Baden Wuerttemberg">Baden Wuerttemberg - Neckargemuend - Gymnasium Neckargemuend
                </option><option value="Heinrich-Sigmund-Gymnasium Privatgymnasium, Schriesheim, Baden Wuerttemberg">Baden Wuerttemberg - Schriesheim - Heinrich-Sigmund-Gymnasium Privatgymnasium
                </option><option value="Kurpfalz-Gymnasium, Schriesheim, Baden Wuerttemberg">Baden Wuerttemberg - Schriesheim - Kurpfalz-Gymnasium
                </option><option value="Dietrich-Bonhoeffer-Gymnasium, Weinheim, Baden Wuerttemberg">Baden Wuerttemberg - Weinheim - Dietrich-Bonhoeffer-Gymnasium
                </option><option value="Johann-Philipp-Reis-Schule, Weinheim, Baden Wuerttemberg">Baden Wuerttemberg - Weinheim - Johann-Philipp-Reis-Schule
                </option><option value="Werner-Heisenberg-Gymnasium, Weinheim, Baden Wuerttemberg">Baden Wuerttemberg - Weinheim - Werner-Heisenberg-Gymnasium
                </option><option value="Spessart-Gymnasium, Alzenau, Bayern">Bayern - Alzenau - Spessart-Gymnasium
                </option><option value="Karl-Ernst-Gymnasium, Amorbach, Bayern">Bayern - Amorbach - Karl-Ernst-Gymnasium
                </option><option value="Berufsschule I, Aschaffenburg, Bayern">Bayern - Aschaffenburg - Berufsschule I
                </option><option value="FOSBOS, Aschaffenburg, Bayern">Bayern - Aschaffenburg - FOSBOS
                </option><option value="Friedrich-Dessauer-Gymnasium, Aschaffenburg, Bayern">Bayern - Aschaffenburg - Friedrich-Dessauer-Gymnasium
                </option><option value="Karl-Theodor-von-Dalberg-Gymnasium, Aschaffenburg, Bayern">Bayern - Aschaffenburg - Karl-Theodor-von-Dalberg-Gymnasium
                </option><option value="Kronberg-Gymnasium, Aschaffenburg, Bayern">Bayern - Aschaffenburg - Kronberg-Gymnasium
                </option><option value="Maria-Ward-Schule, Aschaffenburg, Bayern">Bayern - Aschaffenburg - Maria-Ward-Schule
                </option><option value="Franz-Miltenberger-Gymnasium, Bad Brueckenau, Bayern">Bayern - Bad Brueckenau - Franz-Miltenberger-Gymnasium
                </option><option value="Bad Kissingen-Gymnasium, Bad Kissingen, Bayern">Bayern - Bad Kissingen - Bad Kissingen-Gymnasium
                </option><option value="Bad Koenigshofen-Gymnasium, Bad Koenigshofen, Bayern">Bayern - Bad Koenigshofen - Bad Koenigshofen-Gymnasium
                </option><option value="Rhoen-Gymnasium, Bad Neustadt, Bayern">Bayern - Bad Neustadt - Rhoen-Gymnasium
                </option><option value="Friedrich-Rueckert-Gymnasium, Ebern, Bayern">Bayern - Ebern - Friedrich-Rueckert-Gymnasium
                </option><option value="Julius-Echter-Gymnasium, Elsenfeld, Bayern">Bayern - Elsenfeld - Julius-Echter-Gymnasium
                </option><option value="Hermann-Staudinger-Gymnasium, Erlenbach, Bayern">Bayern - Erlenbach - Hermann-Staudinger-Gymnasium
                </option><option value="Friedrich-List-Gymnasium, Gemuenden, Bayern">Bayern - Gemuenden - Friedrich-List-Gymnasium
                </option><option value="MBW Schwestern vom Heiligen Kreuz, Gemuenden, Bayern">Bayern - Gemuenden - MBW Schwestern vom Heiligen Kreuz
                </option><option value="Frobenius-Gymnasium, Hammelburg, Bayern">Bayern - Hammelburg - Frobenius-Gymnasium
                </option><option value="Regiomontanus-Gymnasium, Hassfurt, Bayern">Bayern - Hassfurt - Regiomontanus-Gymnasium
                </option><option value="Hanns-Seidel-Gymnasium, Hoesbach, Bayern">Bayern - Hoesbach - Hanns-Seidel-Gymnasium
                </option><option value="Kolleg der Schulbrüder, Illertissen, Bayern">Bayern - Illertissen - Kolleg der Schulbrüder
                </option><option value="Johann-Schoener-Gymnasium, Karlstadt, Bayern">Bayern - Karlstadt - Johann-Schoener-Gymnasium
                </option><option value="Armin-Knab-Gymnasium, Kitzingen, Bayern">Bayern - Kitzingen - Armin-Knab-Gymnasium
                </option><option value="Franz-Ludwig-von-Erthal-Gymnasium, Lohr, Bayern">Bayern - Lohr - Franz-Ludwig-von-Erthal-Gymnasium
                </option><option value="Fraenkische Akademie Privates Abendgymnasium, Margetshoechheim, Bayern">Bayern - Margetshoechheim - Fraenkische Akademie Privates Abendgymnasium
                </option><option value="Gymnasium Marktbreit, Marktbreit, Bayern">Bayern - Marktbreit - Gymnasium Marktbreit
                </option><option value="Balthasar-Neumann-Gymnasium, Marktheidenfeld, Bayern">Bayern - Marktheidenfeld - Balthasar-Neumann-Gymnasium
                </option><option value="Martin-Pollich-Gymnasium, Mellrichstadt, Bayern">Bayern - Mellrichstadt - Martin-Pollich-Gymnasium
                </option><option value="Johannes-Butzbach-Gymnasium, Miltenberg, Bayern">Bayern - Miltenberg - Johannes-Butzbach-Gymnasium
                </option><option value="Johann-Philipp-von-Schoenborn-Gymnasium, Muennerstadt, Bayern">Bayern - Muennerstadt - Johann-Philipp-von-Schoenborn-Gymnasium
                </option><option value="Egbert-Gymnasium, Muensterschwarzach, Bayern">Bayern - Muensterschwarzach - Egbert-Gymnasium
                </option><option value="Alexander-von-Humboldt-Gymnasium, Schweinfurt, Bayern">Bayern - Schweinfurt - Alexander-von-Humboldt-Gymnasium
                </option><option value="Bayernkolleg, Schweinfurt, Bayern">Bayern - Schweinfurt - Bayernkolleg
                </option><option value="Celtis-Gymnasium, Schweinfurt, Bayern">Bayern - Schweinfurt - Celtis-Gymnasium
                </option><option value="Olympia-Morata-Gymnasium, Schweinfurt, Bayern">Bayern - Schweinfurt - Olympia-Morata-Gymnasium
                </option><option value="Walther-Rathenau-Gymnasium, Schweinfurt, Bayern">Bayern - Schweinfurt - Walther-Rathenau-Gymnasium
                </option><option value="Gymnasium Veitshoechheim, Veitshoechheim, Bayern">Bayern - Veitshoechheim - Gymnasium Veitshoechheim
                </option><option value="Franken-Landschulheim Schloss Gaibach, Volkach, Bayern">Bayern - Volkach - Franken-Landschulheim Schloss Gaibach
                </option><option value="Steigerwald-Landschulheim, Wiesentheid, Bayern">Bayern - Wiesentheid - Steigerwald-Landschulheim
                </option><option value="Deutschhaus-Gymnasium, Wuerzburg, Bayern">Bayern - Wuerzburg - Deutschhaus-Gymnasium
                </option><option value="Freie Waldorfschule, Wuerzburg, Bayern">Bayern - Wuerzburg - Freie Waldorfschule
                </option><option value="Friedrich-Koenig-Gymnasium, Wuerzburg, Bayern">Bayern - Wuerzburg - Friedrich-Koenig-Gymnasium
                </option><option value="Matthias-Gruenewald-Gymnasium, Wuerzburg, Bayern">Bayern - Wuerzburg - Matthias-Gruenewald-Gymnasium
                </option><option value="Mozart- und Schoenborn-Gymnasium, Wuerzburg, Bayern">Bayern - Wuerzburg - Mozart- und Schoenborn-Gymnasium
                </option><option value="Mozart-Gymnasium, Wuerzburg, Bayern">Bayern - Wuerzburg - Mozart-Gymnasium
                </option><option value="Riemenschneider-Gymnasium, Wuerzburg, Bayern">Bayern - Wuerzburg - Riemenschneider-Gymnasium
                </option><option value="Roentgen-Gymnasium, Wuerzburg, Bayern">Bayern - Wuerzburg - Roentgen-Gymnasium
                </option><option value="Siebold-Gymnasium, Wuerzburg, Bayern">Bayern - Wuerzburg - Siebold-Gymnasium
                </option><option value="St. Ursula-Gymnasium, Wuerzburg, Bayern">Bayern - Wuerzburg - St. Ursula-Gymnasium
                </option><option value="Wirsberg-Gymnasium, Wuerzburg, Bayern">Bayern - Wuerzburg - Wirsberg-Gymnasium
                </option><option value="Elisabeth-Langgaesser-Gymnasium, Alzey, Rheinland-Pfalz">Rheinland-Pfalz - Alzey - Elisabeth-Langgaesser-Gymnasium
                </option><option value="Gymnasium am Roemerkastell, Alzey, Rheinland-Pfalz">Rheinland-Pfalz - Alzey - Gymnasium am Roemerkastell
                </option><option value="Staatliches Aufbaugymnasium, Alzey, Rheinland-Pfalz">Rheinland-Pfalz - Alzey - Staatliches Aufbaugymnasium
                </option><option value="Werner-Heisenberg-Gymnasium, Bad Duerkheim, Rheinland-Pfalz">Rheinland-Pfalz - Bad Duerkheim - Werner-Heisenberg-Gymnasium
                </option><option value="Private Hildegardisschule, Bingen, Rheinland-Pfalz">Rheinland-Pfalz - Bingen - Private Hildegardisschule
                </option><option value="Stefan-George-Gymnasium, Bingen, Rheinland-Pfalz">Rheinland-Pfalz - Bingen - Stefan-George-Gymnasium
                </option><option value="Gymnasium Weiherhof, Bolanden, Rheinland-Pfalz">Rheinland-Pfalz - Bolanden - Gymnasium Weiherhof
                </option><option value="Staatliches Kant-Gymnasium, Boppard, Rheinland-Pfalz">Rheinland-Pfalz - Boppard - Staatliches Kant-Gymnasium
                </option><option value="Hohenstaufen Gymnasium, Kaiserslautern, Rheinland-Pfalz">Rheinland-Pfalz - Kaiserslautern - Hohenstaufen Gymnasium
                </option><option value="Nordpfalzgymnasium, Kirchheimbolanden, Rheinland-Pfalz">Rheinland-Pfalz - Kirchheimbolanden - Nordpfalzgymnasium
                </option><option value="Berufsbildende Schule Gewerbe und Hauswirtschaft/Sozialwesen, Koblenz, Rheinland-Pfalz">Rheinland-Pfalz - Koblenz - Berufsbildende Schule Gewerbe und Hauswirtschaft/Sozialwesen
                </option><option value="Berufsbildende Schule fuer Naturwissenschaften, Ludwigshafen, Rheinland-Pfalz">Rheinland-Pfalz - Ludwigshafen - Berufsbildende Schule fuer Naturwissenschaften
                </option><option value="Berufsbildende Schule I Gewerbe und Technik, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Berufsbildende Schule I Gewerbe und Technik
                </option><option value="Bischoefliches Willigis-Gymnasium, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Bischoefliches Willigis-Gymnasium
                </option><option value="Frauenlob-Gymnasium, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Frauenlob-Gymnasium
                </option><option value="Freie Waldorfschule, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Freie Waldorfschule
                </option><option value="Gutenberg-Gymnasium, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Gutenberg-Gymnasium
                </option><option value="Gymnasium am Kurfuerstlichen Schloss, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Gymnasium am Kurfuerstlichen Schloss
                </option><option value="Gymnasium Mainz-Gonsenheim, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Gymnasium Mainz-Gonsenheim
                </option><option value="Integrierte Gesamtschule Berliner Siedlung, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Integrierte Gesamtschule Berliner Siedlung
                </option><option value="Integrierte Gesamtschule Mainz, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Integrierte Gesamtschule Mainz
                </option><option value="Ketteler-Kolleg des Bistums Mainz, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Ketteler-Kolleg des Bistums Mainz
                </option><option value="Maria-Ward-Gymnasium, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Maria-Ward-Gymnasium
                </option><option value="Rabanus-Maurus-Gymnasium, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Rabanus-Maurus-Gymnasium
                </option><option value="Theresianum, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Theresianum
                </option><option value="Wilhelm-Leuschner-Schule Integrierte Gesamtschule, Mainz, Rheinland-Pfalz">Rheinland-Pfalz - Mainz - Wilhelm-Leuschner-Schule Integrierte Gesamtschule
                </option><option value="Gymnasium Nieder-Olm, Nieder-Olm, Rheinland-Pfalz">Rheinland-Pfalz - Nieder-Olm - Gymnasium Nieder-Olm
                </option><option value="Carl-Zuckmayer-Realschule, Nierstein, Rheinland-Pfalz">Rheinland-Pfalz - Nierstein - Carl-Zuckmayer-Realschule
                </option><option value="Gymnasium zu St. Katharinen, Oppenheim, Rheinland-Pfalz">Rheinland-Pfalz - Oppenheim - Gymnasium zu St. Katharinen
                </option><option value="Edith-Stein-Gymnasium, Speyer, Rheinland-Pfalz">Rheinland-Pfalz - Speyer - Edith-Stein-Gymnasium
                </option><option value="Friedrich-Magnus-Schwerd-Gymnasium, Speyer, Rheinland-Pfalz">Rheinland-Pfalz - Speyer - Friedrich-Magnus-Schwerd-Gymnasium
                </option><option value="Gymnasium am Kaiserdom, Speyer, Rheinland-Pfalz">Rheinland-Pfalz - Speyer - Gymnasium am Kaiserdom
                </option><option value="Hans-Purrmann-Gymnasium, Speyer, Rheinland-Pfalz">Rheinland-Pfalz - Speyer - Hans-Purrmann-Gymnasium
                </option><option value="Nikolaus-von-Weis-Gymnasium, Speyer, Rheinland-Pfalz">Rheinland-Pfalz - Speyer - Nikolaus-von-Weis-Gymnasium
                </option><option value="Staatliches Pfalz-Kolleg und -Abendgymnasium, Speyer, Rheinland-Pfalz">Rheinland-Pfalz - Speyer - Staatliches Pfalz-Kolleg und -Abendgymnasium
                </option><option value="Wilhelm-Erb-Gymnasium, Winnweiler, Rheinland-Pfalz">Rheinland-Pfalz - Winnweiler - Wilhelm-Erb-Gymnasium
                </option><option value="Eleonoren-Gymnasium, Worms, Rheinland-Pfalz">Rheinland-Pfalz - Worms - Eleonoren-Gymnasium
                </option><option value="Gauss-Gymnasium, Worms, Rheinland-Pfalz">Rheinland-Pfalz - Worms - Gauss-Gymnasium
                </option><option value="Rudi-Stephan-Gymnasium, Worms, Rheinland-Pfalz">Rheinland-Pfalz - Worms - Rudi-Stephan-Gymnasium
                </option><option value="Johann-Friedrich-Pierer Schule, Altenburg, Thueringen">Thueringen - Altenburg - Johann-Friedrich-Pierer Schule
                </option><option value="Fernakademie, Hamburg, Hamburg">Hamburg - Hamburg - Fernakademie
                </option><option value="Sonstiges">Nicht vorhanden (bitte in Kommentarfeld ergaenzen)</option>
                <option value="Keine">Nicht an einer Schule</option>
            </select>


            <label>Jahrgang</label>
            <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
            >
                <option value="">Jahrgang auswählen</option>
                <option value="jünger">Jünger als Klasse 10</option>
                <option value="Klasse-10">Klasse 10</option>
                <option value="Klasse-11">Klasse 11</option>
                <option value="Klasse-12">Klasse 12</option>
                <option value="Klasse-13">Klasse 13</option>
                <option value="Klasse-10-G">Klasse 10 G8</option>
                <option value="Klasse-11-G">Klasse 11 G8</option>
                <option value="Klasse-12-G">Klasse 12 G8</option>
                <option value="teachers">Lehrer</option>
                <option value="others">Andere</option>
            </select>

            <p className="info-text">
                Falls Ihre Schule nicht gelistet ist, wählen Sie "Nicht vorhanden"
                und ergänzen Sie sie im Kommentarfeld.
            </p>
            </div>

            {/* SECTION 5 — MOTIVATION */}
            <div className="form-section">
            <h2>(5) Kurze Begründung</h2>
            <textarea
                placeholder="Warum möchten Sie an SMP teilnehmen?"
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
            ></textarea>
            </div>

            {/* SECTION 6 — COMMENTS */}
            <div className="form-section">
            <h2>(6) Kommentare</h2>
            <textarea
                placeholder="Weitere Hinweise, Wünsche..."
                name="comments"
                value={formData.comments}
                onChange={handleChange}
            ></textarea>
            </div>

            <button className="submit-btn" type="submit">
            Registrieren
            </button>

            {message && <p>{message}</p>}
        </form>
        </div>
    </div>
    );

}