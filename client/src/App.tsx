// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, Toolbar, CssBaseline } from "@mui/material";
import AppHeader from "./components/UI/AppHeaderComponent";

import LandingPage from "./pages/LandingPage";
import OnboardingPageEmployee from "./pages/OnboardingPageEmployee";
import DashboardPage from "./pages/DashboardPage";
import SaveSuccessPage from "./pages/SaveSuccessPage";
import DrawAreaPage from "./pages/MapDrawSearchArea";
import EditDrawnRequestPage from "./pages/EditDrawnRequestPage";
import MapPage from "./pages/MapShowFoundJobs";

function App() {
  return (
    <>
      <CssBaseline />

      {/* Fullscreen Layout mit fixiertem Header */}
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 🔝 Fixierter Header */}
        <AppHeader />

        {/* Spacer in Höhe der AppBar/Toolbar, verhindert Überlappung */}
        <Toolbar />

        {/* Hauptbereich füllt den Rest; minHeight:0 verhindert Scroll-Jank */}
        <Box component="main" sx={{ flex: 1, minHeight: 0, display: "flex" }}>
          {/* ⬇️ Hier: overflow auf auto statt hidden */}
          <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<OnboardingPageEmployee />} />
              <Route path="/dashboard" element={<DashboardPage />} />
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
        </Box>
      </Box>
    </>
  );
}

export default App;
