import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";

interface FeatureCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    company: string;
    description: string;
  }) => void;
}

const FeatureCreateDialog = ({
  open,
  onClose,
  onSave,
}: FeatureCreateDialogProps) => {
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
  });

  useEffect(() => {
    if (open) {
      setForm({ title: "", company: "", description: "" });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{ zIndex: 1500 }} // wichtig, um über der Karte zu sein
    >
      <DialogTitle>Neues Feature eintragen</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            name="title"
            label="Titel"
            value={form.title}
            onChange={handleChange}
            fullWidth
            autoFocus
          />
          <TextField
            name="description"
            label="Beschreibung"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSubmit} variant="contained">
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeatureCreateDialog;
