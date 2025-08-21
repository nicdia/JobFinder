// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import LandingPage from "./pages/LandingPage";
// import FoundJobMapPage from "./pages/MapShowFoundJobs"; // ❌ nicht mehr nutzen
import OnboardingPageEmployee from "./pages/OnboardingPageEmployee";
import DashboardPage from "./pages/DashboardPage";
import SaveSuccessPage from "./pages/SaveSuccessPage";
import DrawAreaPage from "./pages/MapDrawSearchArea";
import EditDrawnRequestPage from "./pages/EditDrawnRequestPage";
import MapPage from "./pages/MapShowFoundJobs";

function App() {
  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPageEmployee />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* ⬇️ /found-jobs zeigt jetzt auf MapPage */}
        <Route path="/found-jobs" element={<MapPage />} />
        <Route path="/save-success" element={<SaveSuccessPage />} />
        <Route path="/draw-search" element={<DrawAreaPage />} />
        <Route
          path="/edit-drawn/:requestId"
          element={<EditDrawnRequestPage />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
}

export default App;
