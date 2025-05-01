import { ToggleButton, ToggleButtonGroup, Button, Stack } from "@mui/material";
import { EditLocationAlt, ShowChart, CropSquare } from "@mui/icons-material";

const DrawToolbar = ({
  isDrawMode,
  setIsDrawMode,
  drawType,
  setDrawType,
  onAbortDraw,
  onSubmitDraw,
}: {
  isDrawMode: boolean;
  setIsDrawMode: (mode: boolean) => void;
  drawType: string | null;
  setDrawType: (type: string | null) => void;
  onAbortDraw: () => void;
  onSubmitDraw: () => void;
}) => {
  const handleChange = (_: any, newType: string | null) => {
    setDrawType(newType);
  };

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
      {isDrawMode && (
        <>
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
        </>
      )}
    </Stack>
  );
};

export default DrawToolbar;
