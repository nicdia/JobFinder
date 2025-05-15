import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/* Helfer zum Datumsformat --------------------------- */
const fmt = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(val?: string) {
  if (!val) return "—";
  const date = new Date(val);
  return isNaN(date.getTime()) ? val : fmt.format(date);
}
/* --------------------------------------------------- */

interface FeatureDialogProps {
  feature: any | null; // GeoJSON Feature oder plain object
  onClose: () => void;
}

export default function FeatureDialog({
  feature,
  onClose,
}: FeatureDialogProps) {
  if (!feature) return null;

  const p = feature.properties ?? feature; // kurzschreibweise

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      {/* Kopfzeile */}
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", pr: 5 }}
        variant="h6"
      >
        <Typography sx={{ flexGrow: 1 }}>{p.title ?? "Job-Eintrag"}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Inhalt */}
      <DialogContent dividers>
        <Stack spacing={1}>
          {/* Firma */}
          <Typography variant="subtitle1">{p.company ?? "—"}</Typography>

          {/* Beschreibung */}
          <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
            {p.description || "Keine Beschreibung vorhanden."}
          </Typography>

          {/* Veröffentlichungs- & Start-Datum */}
          <Typography variant="body2">
            <strong>Veröffentlicht:</strong> {formatDate(p.published_at)}
          </Typography>
          <Typography variant="body2">
            <strong>Startdatum:</strong> {formatDate(p.starting_date)}
          </Typography>

          {/* Externer Link */}
          {p.external_url && (
            <Button
              href={p.external_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              sx={{ mt: 1, alignSelf: "flex-start" }}
            >
              Zur Stellenanzeige
            </Button>
          )}
        </Stack>
      </DialogContent>

      {/* Aktionen */}
      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>
      </DialogActions>
    </Dialog>
  );
}
