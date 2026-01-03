import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import HomePage from "./pages/HomePage";
import AdminRegistrationsListPage from "./pages/AdminRegistrationsListPage";
import AdminRegistrationDetailPage from "./pages/AdminRegistrationDetailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OHomePage from "./pages/oHomePage";
import EventListPage from "./pages/EventListPage";
import EventDetailPage from "./pages/EventDetailPage";
import SessionListPage from "./pages/SessionListPage";
import HiWiListPage from "./pages/HiwiListPage";
import BusinessCardPage from "./pages/BusinessCardPage";
import QuizListPage from "./pages/QuizListPage";
import StatisticsPage from "./pages/StatisticsPage";
import StudentHomePage from "./pages/StudentHomePage";
import HiwiHomePage from "./pages/HiwiHomePage";
import HiWiStatisticsPage from "./pages/HiwiStatisticsPage";
import StudentQrPage from "./pages/StudentQrPage";
import OrganizerAnnouncements from "./pages/OrganizerAnnouncements";
import HiWiQrScanPage from "./pages/HiwiQrScanPage";
import AttendanceData from "./pages/AttendanceData";
import QuizSubmissionPage from "./pages/QuizSubmissionPage";
import QuizResultsPage from "./pages/QuizResultsPage";
import QuestionManagementPage from "./pages/QuestionManagementPage";
import QuizCreationPage from "./pages/QuizCreationPage";

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
        <Route path="/ohomepage" element={<OHomePage/>} />
        <Route path="/ohomepage/eventlist" element={<EventListPage/>} />
        <Route path= "/ohomepage/eventdetail" element={<EventDetailPage/>} />
        <Route path="/ohomepage/sessionlist" element={<SessionListPage/>} />
        <Route path="/ohomepage/hiwilist" element={<HiWiListPage/>} />
        <Route path="/studenthomepage/businesscard" element={<BusinessCardPage/>} />
        <Route path="/ohomepage/quizlist" element={<QuizListPage/>} />
        <Route path="/ohomepage/statistics" element={<StatisticsPage/>} />
        <Route path="/studenthomepage" element={<StudentHomePage/>} />
        <Route path="/hiwihomepage" element={<HiwiHomePage/>} />
        <Route path="/hiwihomepage/statistics" element={<HiWiStatisticsPage/>} />
        <Route path="/studenthomepage/qr" element={<StudentQrPage/>} />
        <Route path="/ohomepage/announcements" element={<OrganizerAnnouncements/>} />
        <Route path="/hiwihomepage/scan" element={<HiWiQrScanPage/>} />
        <Route path="/ohomepage/attendance" element={<AttendanceData/>} />
        <Route path="/quiz/session/:sessionId" element={<QuizSubmissionPage/>} />
        <Route path="/quiz/:quizId/results" element={<QuizResultsPage/>} />
        <Route path="/quizlist" element={<QuizListPage/>} />
        <Route path="/questions" element={<QuestionManagementPage/>} />
        <Route path="/quiz/create" element={<QuizCreationPage/>} />

        {/* optional: catch-all for invalid routes */}
        <Route path="*" element={<h1>404 - Seite nicht gefunden</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
