import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import ShortCodeRedirectPage from "./pages/ShortCodeRedirectPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics/:code" element={<AnalyticsPage />} />
      </Route>
      <Route path="/:code" element={<ShortCodeRedirectPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
