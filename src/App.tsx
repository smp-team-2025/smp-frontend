import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* redirect / to /login */}
        <Route path="/" element={<Navigate to="/homepage" replace />} />

        <Route path="/homepage" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />

        {/* optional: catch-all for invalid routes */}
        <Route path="*" element={<h1>404 - Seite nicht gefunden</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
