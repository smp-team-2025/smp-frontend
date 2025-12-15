import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import HomePage from "./pages/HomePage";
import AdminRegistrationsListPage from "./pages/AdminRegistrationsListPage";
import AdminRegistrationDetailPage from "./pages/AdminRegistrationDetailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* redirect / to /login */}
        <Route path="/" element={<Navigate to="/homepage" replace />} />

        <Route path="/homepage" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/admin/registrations" element={<AdminRegistrationsListPage />} />
        <Route path="/admin/registrations/:id" element={<AdminRegistrationDetailPage />} />
        <Route path="/login/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage/>} />
        

        {/* optional: catch-all for invalid routes */}
        <Route path="*" element={<h1>404 - Seite nicht gefunden</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
