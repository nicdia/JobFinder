// import { ToggleButton, ToggleButtonGroup, Button, Stack } from "@mui/material";
// import { EditLocationAlt, ShowChart, CropSquare } from "@mui/icons-material";
// import { DrawType, DrawToolbarProps } from "../../types/types";

// const DrawToolbar = ({
//   isDrawMode,
//   setIsDrawMode,
//   drawType,
//   setDrawType,
//   onAbortDraw,
//   onSubmitDraw,
// }: DrawToolbarProps) => {
//   const handleChange = (_: any, newType: DrawType) => {
//     setDrawType(newType);
//   };

//   if (!isDrawMode) {
//     return (
//       <Stack
//         direction="column"
//         spacing={1}
//         sx={{
//           position: "absolute",
//           top: 16,
//           right: 16,
//           backgroundColor: "white",
//           p: 1,
//           zIndex: 1000,
//           borderRadius: 1,
//         }}
//       >
//         <Button
//           variant={isDrawMode ? "outlined" : "contained"}
//           color={isDrawMode ? "secondary" : "primary"}
//           onClick={() => {
//             if (isDrawMode) {
//               onAbortDraw();
//             } else {
//               setIsDrawMode(true);
//             }
//           }}
//         >
//           {isDrawMode ? "Zeichnen abbrechen" : "Zeichnen starten"}
//         </Button>
//       </Stack>
//     );
//   }

//   return (
//     <Stack
//       direction="column"
//       spacing={1}
//       sx={{
//         position: "absolute",
//         top: 16,
//         right: 16,
//         backgroundColor: "white",
//         p: 1,
//         zIndex: 1000,
//         borderRadius: 1,
//       }}
//     >
//       <ToggleButtonGroup value={drawType} exclusive onChange={handleChange}>
//         <ToggleButton value="Point" title="Punkt zeichnen">
//           <EditLocationAlt />
//         </ToggleButton>
//         <ToggleButton value="LineString" title="Linie zeichnen">
//           <ShowChart />
//         </ToggleButton>
//         <ToggleButton value="Polygon" title="Polygon zeichnen">
//           <CropSquare />
//         </ToggleButton>
//       </ToggleButtonGroup>

//       {drawType && (
//         <>
//           <Button variant="outlined" onClick={onAbortDraw}>
//             Zeichnen abbrechen
//           </Button>
//           <Button variant="contained" onClick={onSubmitDraw}>
//             Suchbereich erstellen
//           </Button>
//         </>
//       )}
//     </Stack>
//   );
// };

// export default DrawToolbar;

import {
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Box,
} from "@mui/material";
import { EditLocationAlt, ShowChart, CropSquare } from "@mui/icons-material";
import { DrawType, DrawToolbarProps } from "../../types/types";

/**
 * DrawToolbar – mit weißem Karten‑Overlay‑Container
 * ▸ Positioniert unterhalb der AppBar
 * ▸ Weißer Hintergrund + Shadow, damit Icons/Buttons stets gut sichtbar bleiben
 */
const DrawToolbar: React.FC<DrawToolbarProps> = ({
  isDrawMode,
  setIsDrawMode,
  drawType,
  setDrawType,
  onAbortDraw,
  onSubmitDraw,
}) => {
  const handleChange = (_: unknown, newType: DrawType) => setDrawType(newType);

  /** Höhe der AppBar ≈ 64 px – etwas Abstand darunter. */
  const WRAPPER_SX = {
    position: "absolute" as const,
    top: 80,
    right: 16,
    zIndex: 1000,
    pointerEvents: "none", // Clicks nur auf untergeordnetes Box‑Element
  };

  const CONTAINER_SX = {
    backgroundColor: "white",
    borderRadius: 1,
    p: 1,
    boxShadow: 4,
    pointerEvents: "auto", // aktiviert
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
