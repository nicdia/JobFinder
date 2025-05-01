import { useState } from "react";
import { Box } from "@mui/material";
import MapComponent from "./components/Map/Map";
import AppHeader from "./components/UI/AppHeader";

function App() {
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [drawType, setDrawType] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<
    "accessibility" | "customArea" | null
  >(null);

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
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
    </Box>
  );
}

export default App;
