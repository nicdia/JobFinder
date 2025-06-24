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

/* ---------- neue Prop --------------------------- */
export interface FeatureCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, string>) => void;
  geometryType: "Point" | "LineString" | "Polygon"; // 🔄
}

export default function FeatureCreateDialog({
  open,
  onClose,
  onSave,
  geometryType, // 🔄
}: FeatureCreateDialogProps) {
  /* ---------- komplette Fragenliste --------------- */
  const allQuestions = [
    {
      key: "reqName",
      label: "Wie soll dein Suchauftrag heißen?",
      options: "text" as const,
    },
    {
      key: "jobType",
      label: "In welchem Bereich möchtest du arbeiten?",
      options: ["Software Engineering", "Data Engineering", "GIS"],
    },
    { key: "cutoff", label: "Max. Anreisezeit (Min.)", options: "text" },
    {
      key: "transport",
      label: "Transportmittel",
      options: ["Zu Fuß", "Radverkehr", "ÖPNV"],
    },
    { key: "speed", label: "Geschwindigkeit (km/h)", options: "text" },
  ];

  /* ---------- dynamisch filtern ------------------- */
  const questions =
    geometryType === "Polygon"
      ? allQuestions.filter(
          (q) => !["cutoff", "transport", "speed"].includes(q.key)
        )
      : allQuestions;

  /* ---------- State / Handler --------------------- */
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    if (open) {
      const empty: Record<string, string> = {};
      questions.forEach((q) => (empty[q.key] = ""));
      setForm(empty);
    }
  }, [open, questions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  /* ---------- Render ------------------------------ */
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={(_, r) => r !== "backdropClick" && onClose()}
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
                SelectProps={{ MenuProps: { disablePortal: true } }}
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
