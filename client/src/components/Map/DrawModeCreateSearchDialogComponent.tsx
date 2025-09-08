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
  Alert,
  Typography,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";

export interface FeatureCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, string>) => void;
  geometryType: "Point" | "LineString" | "Polygon";
}

// ► Durchschnittsgeschwindigkeiten (Orientierung)
const WALK_SPEED = 5;
const AVG_SPEEDS: Record<string, { value: number; note: string }> = {
  "Zu Fuß": { value: WALK_SPEED, note: "typisch 4,5–5,5 km/h" },
  Radverkehr: { value: 18, note: "Stadtfahrt ca. 15–20 km/h" },
  ÖPNV: {
    value: WALK_SPEED,
    note: "bezieht sich auf Fußwege zwischen/zu Stationen – gleiche Geschwindigkeit wie „Zu Fuß“",
  },
};

export default function FeatureCreateDialog({
  open,
  onClose,
  onSave,
  geometryType,
}: FeatureCreateDialogProps) {
  const allQuestions = [
    {
      key: "reqName",
      label: "Wie soll dein Suchauftrag heißen?",
      options: "text" as const,
    },
    {
      key: "jobType",
      label: "In welchem Bereich möchtest du arbeiten?",
      options: ["Software Engineering", "Data Engineering", "GIS"] as const,
    },
    {
      key: "cutoff",
      label: "Max. Anreisezeit (Min.)",
      options: "text" as const,
    },
    {
      key: "transport",
      label: "Transportmittel",
      options: ["Zu Fuß", "Radverkehr", "ÖPNV"] as const,
    },
    { key: "speed", label: "Geschwindigkeit (km/h)", options: "text" as const },
  ];

  const questions = useMemo(
    () =>
      geometryType === "Polygon"
        ? allQuestions.filter(
            (q) => !["cutoff", "transport", "speed"].includes(q.key)
          )
        : allQuestions,
    [geometryType]
  );

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const empty = questions.reduce<Record<string, string>>((acc, q) => {
        acc[q.key] = "";
        return acc;
      }, {});
      setForm(empty);
    }
  }, [open, questions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Wenn Transport gewechselt wird: Vorschlags-Speed vorbelegen, falls leer
    if (name === "transport") {
      const suggestion = AVG_SPEEDS[value]?.value;
      setForm((prev) => ({
        ...prev,
        [name]: value,
        speed: prev.speed?.trim()
          ? prev.speed
          : suggestion !== undefined
          ? String(suggestion)
          : "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  const selectedTransport = form.transport;
  const suggested = selectedTransport
    ? AVG_SPEEDS[selectedTransport]
    : undefined;

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
              <Stack key={q.key} spacing={1}>
                <TextField
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

                {/* Info unter dem Transport-Feld */}
                {q.key === "transport" && (
                  <Alert severity="info" variant="outlined">
                    <Typography variant="body2">
                      Orientierung Durchschnittsgeschwindigkeit:
                      <br />
                      <strong>Zu Fuß</strong> ≈ {AVG_SPEEDS["Zu Fuß"].value}{" "}
                      km/h ({AVG_SPEEDS["Zu Fuß"].note}) ·{" "}
                      <strong>Radverkehr</strong> ≈{" "}
                      {AVG_SPEEDS["Radverkehr"].value} km/h (
                      {AVG_SPEEDS["Radverkehr"].note}) · <strong>ÖPNV</strong> ≈{" "}
                      {AVG_SPEEDS["ÖPNV"].value} km/h ({AVG_SPEEDS["ÖPNV"].note}
                      )
                    </Typography>
                  </Alert>
                )}
              </Stack>
            ) : (
              <Stack key={q.key} spacing={1}>
                <TextField
                  name={q.key}
                  label={q.label}
                  value={form[q.key] ?? ""}
                  onChange={handleChange}
                  fullWidth
                />

                {/* Info + Vorschlag im Speed-Feld */}
                {q.key === "speed" && suggested && (
                  <Alert severity="info" variant="outlined">
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Typography variant="body2">
                        Für <strong>{selectedTransport}</strong> liegt die
                        maßgebliche Durchschnittsgeschwindigkeit bei{" "}
                        <strong>{suggested.value} km/h</strong> (
                        {suggested.note}). Du kannst den Wert anpassen oder
                        übernehmen.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            speed: String(suggested.value),
                          }))
                        }
                      >
                        Vorschlag übernehmen
                      </Button>
                    </Stack>
                  </Alert>
                )}
              </Stack>
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
