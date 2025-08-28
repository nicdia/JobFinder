import {
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Box,
} from "@mui/material";
import { EditLocationAlt, ShowChart, CropSquare } from "@mui/icons-material";
import { DrawType, DrawToolbarProps } from "../../types/types";

const DrawToolbar: React.FC<DrawToolbarProps> = ({
  isDrawMode,
  setIsDrawMode,
  drawType,
  setDrawType,
  onAbortDraw,
  onSubmitDraw,
}) => {
  const handleChange = (_: unknown, newType: DrawType | null) =>
    setDrawType(newType as DrawType);

  const WRAPPER_SX = {
    position: "absolute" as const,
    top: 80,
    right: 16,
    zIndex: 1000,
    pointerEvents: "none" as const,
  };

  const CONTAINER_SX = {
    backgroundColor: "white",
    borderRadius: 1,
    p: 1,
    boxShadow: 4,
    pointerEvents: "auto" as const,
  };

  const BUTTON_COMMON_SX = {
    px: 4,
    py: 1.2,
    fontSize: "1rem",
  };

  if (!isDrawMode) {
    return (
      <Box sx={WRAPPER_SX}>
        <Stack direction="column" spacing={1} sx={CONTAINER_SX}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setIsDrawMode(true)}
            sx={BUTTON_COMMON_SX}
          >
            ZEICHNEN STARTEN
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={WRAPPER_SX}>
      <Stack direction="column" spacing={1} sx={CONTAINER_SX}>
        <ToggleButtonGroup
          value={drawType}
          exclusive
          onChange={handleChange}
          sx={{ alignSelf: "center" }}
        >
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
            <Button
              variant="outlined"
              color="secondary"
              onClick={onAbortDraw}
              sx={BUTTON_COMMON_SX}
            >
              Zeichnen abbrechen
            </Button>
            <Button
              variant="contained"
              onClick={onSubmitDraw}
              sx={BUTTON_COMMON_SX}
            >
              Suchbereich erstellen
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default DrawToolbar;
