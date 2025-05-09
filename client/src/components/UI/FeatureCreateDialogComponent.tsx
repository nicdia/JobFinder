// src/components/UI/FeatureCreateDialogComponent.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";

interface FeatureCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, string>) => void;
}

export default function FeatureCreateDialog({
  open,
  onClose,
  onSave,
}: FeatureCreateDialogProps) {
  /** Fragen‑Konfiguration */
  const questions = [
    {
      key: "jobType",
      label: "In welchem Bereich möchtest du arbeiten?",
      options: ["Software Engineering", "AI/Data", "Projektmanagement"],
    },
    {
      key: "transport",
      label: "Welches Transportmittel möchtest du nutzen?",
      options: ["Zu Fuß", "Radverkehr", "ÖPNV"],
    },
    {
      key: "speed",
      label:
        "Wie hoch ist deine Geschwindigkeit mit deinem ausgewählten Transportmittel?",
      options: "text" as const, // normales Eingabefeld
    },
  ];

  const [form, setForm] = useState<Record<string, string>>({});

  /** Beim Öffnen leere Felder anlegen */
  useEffect(() => {
    if (open) {
      const empty: Record<string, string> = {};
      questions.forEach((q) => (empty[q.key] = ""));
      setForm(empty);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={(_, reason) => reason !== "backdropClick" && onClose()}
    >
      <DialogTitle>Neues Feature eintragen</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} mt={1}>
          {questions.map((q) =>
            Array.isArray(q.options) ? (
              <TextField
                key={q.key}
                name={q.key}
                label={q.label}
                value={form[q.key] ?? ""}
                onChange={handleChange}
                fullWidth
                select
                SelectProps={{
                  MenuProps: { disablePortal: true }, // Dropdown IM Dialog
                }}
              >
                {q.options.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                key={q.key}
                name={q.key}
                label={q.label}
                value={form[q.key] ?? ""}
                onChange={handleChange}
                fullWidth
              />
            )
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
