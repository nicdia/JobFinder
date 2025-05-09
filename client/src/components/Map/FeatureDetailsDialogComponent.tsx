import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface FeatureDialogProps {
  feature: any | null;
  onClose: () => void;
}

const FeatureDialog = ({ feature, onClose }: FeatureDialogProps) => {
  if (!feature) return null;

  const props = feature.properties ?? feature; // GeoJSON oder flach

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {props.title || "Kein Titel"}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>
          {props.company || "Keine Firma"}
        </Typography>
        <Typography variant="body2">
          {props.description || "Keine Beschreibung"}
        </Typography>
        {props.external_url && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <a
              href={props.external_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Zur Stellenanzeige
            </a>
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeatureDialog;
