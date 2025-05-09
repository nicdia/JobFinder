import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import AppHeader from "../components/UI/AppHeaderComponent";
import MapComponent from "../components/Map/MapComponent";
import FeatureDialog from "../components/Map/FeatureDetailsDialogComponent";
import { fetchAllJobs } from "../services/allJobsApi";
import { fetchUserVisibleJobs } from "../services/fetchUserVisibleJobs";
import { useAuth } from "../context/AuthContext";

const MapPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  /* --- 🆕 Feature‑Auswahl ------------------- */
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const handleFeatureClick = useCallback((feature: any) => {
    setSelectedFeature(feature);
  }, []);
  const handleDialogClose = () => setSelectedFeature(null);
  /* ----------------------------------------- */

  useEffect(() => {
    console.log("[MapPage] route mode:", mode);
    console.log("[MapPage] current user:", user);
  }, [mode, user]);

  if (mode === "customVisible" && !user?.id) {
    console.log("[MapPage] warte auf Benutzer‑Infos …");
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const fetchFunction = () =>
    mode === "customVisible" ? fetchUserVisibleJobs(user!) : fetchAllJobs();

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <AppHeader />
      <MapComponent
        key={mode + (user?.id ?? "anon")}
        fetchFunction={fetchFunction}
        onFeatureClick={handleFeatureClick} /* 🆕 */
      />
      <FeatureDialog /* 🆕 */
        feature={selectedFeature}
        onClose={handleDialogClose}
      />
    </Box>
  );
};

export default MapPage;
