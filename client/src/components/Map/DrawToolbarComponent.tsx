import { ToggleButton, ToggleButtonGroup, Button, Stack } from "@mui/material";
import { EditLocationAlt, ShowChart, CropSquare } from "@mui/icons-material";
import { Dispatch, SetStateAction } from "react";

type DrawType = "Polygon" | "Point" | "LineString" | null;

interface DrawToolbarProps {
  isDrawMode: boolean;
  setIsDrawMode: Dispatch<SetStateAction<boolean>>;
  drawType: DrawType;
  setDrawType: Dispatch<SetStateAction<DrawType>>;
  onAbortDraw: () => void;
  onSubmitDraw: () => void;
}

const DrawToolbar = ({
  isDrawMode,
  setIsDrawMode,
  drawType,
  setDrawType,
  onAbortDraw,
  onSubmitDraw,
}: DrawToolbarProps) => {
  const handleChange = (_: any, newType: DrawType) => {
    setDrawType(newType);
  };

  if (!isDrawMode) {
    return (
      <Stack
        direction="column"
        spacing={1}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "white",
          p: 1,
          zIndex: 1000,
          borderRadius: 1,
        }}
      >
        <Button
          variant={isDrawMode ? "outlined" : "contained"}
          color={isDrawMode ? "secondary" : "primary"}
          onClick={() => {
            if (isDrawMode) {
              onAbortDraw();
            } else {
              setIsDrawMode(true);
            }
          }}
        >
          {isDrawMode ? "Zeichnen abbrechen" : "Zeichnen starten"}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack
      direction="column"
      spacing={1}
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        backgroundColor: "white",
        p: 1,
        zIndex: 1000,
        borderRadius: 1,
      }}
    >
      <ToggleButtonGroup value={drawType} exclusive onChange={handleChange}>
        <ToggleButton value="Point" title="Punkt zeichnen">
          <EditLocationAlt />
        </ToggleButton>
        <ToggleButton value="LineString" title="Linie zeichnen">
          <ShowChart />
        </ToggleButton>
        <ToggleButton value="Polygon" title="Polygon zeichnen">
          <CropSquare />
        </ToggleButton>
      </ToggleButtonGroup>

      {drawType && (
        <>
          <Button variant="outlined" onClick={onAbortDraw}>
            Zeichnen abbrechen
          </Button>
          <Button variant="contained" onClick={onSubmitDraw}>
            Suchbereich erstellen
          </Button>
        </>
      )}
    </Stack>
  );
};

export default DrawToolbar;
