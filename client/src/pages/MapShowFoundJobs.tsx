import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box } from "@mui/material";
import AppHeader from "../components/UI/AppHeaderComponent";
import MapComponent from "../components/Map/MapComponent";
import { fetchAllJobs } from "../services/allJobsApi";
import { fetchUserVisibleJobs } from "../services/fetchUserVisibleJobs";
import { useAuth } from "../context/AuthContext";

const MapPage = () => {
  const { user } = useAuth();
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [drawType, setDrawType] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<
    "accessibility" | "customArea" | null
  >(null);
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const fetchFunction = () => {
    if (mode === "customVisible") {
      return fetchUserVisibleJobs();
    }
    return fetchAllJobs(); // fallback: alle Jobs
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
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

      <Box sx={{ flex: 1 }}>
        <MapComponent
          drawType={drawType}
          setDrawType={setDrawType}
          isDrawMode={isDrawMode}
          setIsDrawMode={setIsDrawMode}
          setSearchOpen={setSearchOpen}
          setSearchMode={setSearchMode}
          fetchFunction={fetchFunction}
        />
      </Box>
    </Box>
  );
};

export default MapPage;
