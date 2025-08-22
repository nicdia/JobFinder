// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, Toolbar, CssBaseline } from "@mui/material";
import AppHeader from "./components/UI/AppHeaderComponent";

import LandingPage from "./pages/LandingPage";
import AddressSearchWizardPage from "./pages/AddressSearchWizardPage"; // 👈 neu: geschützte Wizard-Page
import DashboardPage from "./pages/DashboardPage";
import SaveSuccessPage from "./pages/SaveSuccessPage";
import DrawAreaPage from "./pages/MapDrawSearchArea";
import EditDrawnRequestPage from "./pages/EditDrawnRequestPage";
import MapPage from "./pages/MapShowFoundJobs";
import MapShowSavedJobs from "./pages/MapShowSavedJobs";
import MapShowAllJobs from "./pages/MapShowAllJobs";
import RequireAuth from "./components/auth/RequireAuth";

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
          <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <Routes>
              {/* öffentlich */}
              <Route path="/" element={<LandingPage />} />

              {/* geschützt */}
              <Route
                path="/address-search"
                element={
                  <RequireAuth>
                    <AddressSearchWizardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <DashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/found-jobs"
                element={
                  <RequireAuth>
                    <MapPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/save-success"
                element={
                  <RequireAuth>
                    <SaveSuccessPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/draw-search"
                element={
                  <RequireAuth>
                    <DrawAreaPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/edit-drawn/:requestId"
                element={
                  <RequireAuth>
                    <EditDrawnRequestPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/saved-jobs"
                element={
                  <RequireAuth>
                    <MapShowSavedJobs />
                  </RequireAuth>
                }
              />
              <Route
                path="/all-jobs"
                element={
                  <RequireAuth>
                    <MapShowAllJobs />
                  </RequireAuth>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;
