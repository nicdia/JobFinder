import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import MapComponent from "./components/Map/Map";
import AppHeader from "./components/UI/AppHeader";
import LandingPage from "./pages/LandingPage";
import OnboardingPageEmployee from "./pages/OnboardingPageEmployee";
import DashboardPage from "./pages/DashboardPage";
function App() {
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [drawType, setDrawType] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<
    "accessibility" | "customArea" | null
  >(null);

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPageEmployee />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/map"
          element={
            <>
              {!isDrawMode && (
                <AppHeader
                  setDrawType={setDrawType}
                  setIsDrawMode={setIsDrawMode}
                  searchOpen={searchOpen}
                  setSearchOpen={setSearchOpen}
                  searchMode={searchMode}
                  setSearchMode={setSearchMode}
                />
              )}
              <MapComponent
                drawType={drawType}
                setDrawType={setDrawType}
                isDrawMode={isDrawMode}
                setIsDrawMode={setIsDrawMode}
                setSearchOpen={setSearchOpen}
                setSearchMode={setSearchMode}
              />
            </>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
}

export default App;
