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

  return (
    <Dialog open={!!feature} onClose={onClose}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {feature.title || "Kein Titel"}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>
          {feature.company || "Keine Firma"}
        </Typography>
        <Typography variant="body2">
          {feature.description || "Keine Beschreibung"}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureDialog;
