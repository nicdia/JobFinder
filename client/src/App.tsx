import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";
import OnboardingPageEmployee from "./pages/OnboardingPageEmployee";
import DashboardPage from "./pages/DashboardPage";
import SaveSuccessPage from "./pages/SaveSuccessPage";

function App() {
  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPageEmployee />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/save-success" element={<SaveSuccessPage />} />
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
}

export default App;
