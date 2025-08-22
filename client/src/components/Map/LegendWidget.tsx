import { memo } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type Props = {
  /** Wenn true, wird ausschließlich "Gespeicherte Jobs" angezeigt */
  onlySavedJobs?: boolean;
  /** Optional: Label überschreiben */
  savedLabel?: string;
};

/**
 * Kompakte Karten-Legende (nur Darstellung, keine Layer-Toggles).
 * Unten rechts "anklebt" (absolute innerhalb des Map-Containers).
 */
const LegendWidget = memo(function LegendWidget({
  onlySavedJobs = false,
  savedLabel = "Gespeicherte Jobs",
}: Props) {
  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        right: 16,
        bottom: 16,
        zIndex: 1201,
        p: 1.5,
        borderRadius: 2,
        minWidth: 180,
        userSelect: "none",
        pointerEvents: "auto",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          Legende
        </Typography>
        <Tooltip title="Kartensymbole">
          <IconButton size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* --- Nur gespeicherte Jobs anzeigen --- */}
      {onlySavedJobs ? (
        <Stack spacing={1.25}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#e91e63", // fill wie im Layer
                boxShadow: "0 0 0 2px #c2185b inset", // stroke wie im Layer
              }}
            />
            <Typography variant="body2">{savedLabel}</Typography>
          </Stack>
        </Stack>
      ) : (
        // --- Standard-Legende (Isochrone, Startpunkt, Jobs) ---
        <Stack spacing={1.25}>
          {/* Isochrone */}
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 22,
                height: 14,
                borderRadius: 0.5,
                border: "2px solid #ff1744",
                background: "rgba(255,23,68,0.15)",
              }}
            />
            <Typography variant="body2">Isochrone</Typography>
          </Stack>

          {/* Startpunkt */}
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#1976d2",
                border: "2px solid #fff",
                boxShadow: "0 0 0 1px #1976d2 inset",
              }}
            />
            <Typography variant="body2">Startpunkt / Anfrage</Typography>
          </Stack>

          {/* Jobs (grau) */}
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#424242",
                boxShadow: "0 0 0 1px #212121 inset",
              }}
            />
            <Typography variant="body2">Jobs</Typography>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
});

export default LegendWidget;
