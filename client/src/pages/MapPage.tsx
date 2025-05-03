import { useState } from "react";
import { Box } from "@mui/material";
import AppHeader from "../components/UI/AppHeader";
import MapComponent from "../components/Map/Map";

const MapPage = () => {
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [drawType, setDrawType] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<
    "accessibility" | "customArea" | null
  >(null);

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
        />
      </Box>
    </Box>
  );
};

export default MapPage;
