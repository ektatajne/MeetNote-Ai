import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import LoginPage from "./pages/LoginPage";
import DashboardHome from "./pages/DashboardHome";
import DashboardShell from "./components/layout/DashboardShell";
import DefaultDashboard from "./pages/dashboards/DefaultDashboard";
import MeetingVideoPage from "./pages/MeetingVideoPage";
import MeetingAudioPage from "./pages/MeetingAudioPage";
import MeetingLivePage from "./pages/MeetingLivePage";
import ColorBlindDashboard from "./pages/dashboards/ColorBlindDashboard";
import DyslexiaDashboard from "./pages/dashboards/DyslexiaDashboard";
import HearingDashboard from "./pages/dashboards/HearingDashboard";
import ADHDDashboard from "./pages/dashboards/ADHDDashboard";

export default function App() {
  return (
    <AccessibilityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardShell />}>
            <Route index element={<DashboardHome />} />
            <Route path="default" element={<DefaultDashboard />} />
            <Route path="meeting/video" element={<MeetingVideoPage />} />
            <Route path="meeting/audio" element={<MeetingAudioPage />} />
            <Route path="meeting/live" element={<MeetingLivePage />} />
            <Route path="colorblind" element={<ColorBlindDashboard />} />
            <Route path="dyslexia" element={<DyslexiaDashboard />} />
            <Route path="hearing" element={<HearingDashboard />} />
            <Route path="adhd" element={<ADHDDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AccessibilityProvider>
  );
}
