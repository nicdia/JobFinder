// src/pages/AddressSearchWizardPage.tsx
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Backdrop,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import AppHeader from "../components/UI/AppHeaderComponent";
import AddressAutocomplete from "../components/UI/AddressAutocompleteComponent";
import { useAuth } from "../context/AuthContext";
import { submitSearchRequest } from "../services/postAddressSearchRequestApi";

const questions = [
  {
    key: "reqName",
    text: "Wie soll dein Suchauftrag genannt werden?",
    options: "text" as const,
  },
  {
    key: "jobType",
    text: "In welchem Bereich möchtest du arbeiten?",
    options: ["Software Engineering", "Data Engineering", "GIS"] as const,
  },
  {
    key: "cutoff",
    text: "Wie hoch darf die Anreisezeit zum Job maximal sein (in Minuten)?",
    options: "text" as const,
  },
  {
    key: "address",
    text: "Wie lautet deine Startadresse? (nur Straße)",
    options: "address" as const,
  },
  {
    key: "houseNumber",
    text: "Wie lautet deine Hausnummer?",
    options: "text" as const,
  },
  {
    key: "transport",
    text: "Welches Transportmittel möchtest du nutzen?",
    options: ["Zu Fuß", "Radverkehr", "ÖPNV"] as const,
  },
  {
    key: "speed",
    text: "Wie hoch ist deine Geschwindigkeit mit deinem ausgewählten Transportmittel (in km/h)?",
    options: "text" as const,
  },
];

type AnswerMap = { [key: string]: any };
type ValError = { key: string; message: string };

const HAMBURG_BBOX = {
  minLon: 8.41292353,
  maxLon: 10.34136536,
  minLat: 53.39400705,
  maxLat: 53.96606789,
};

function isFloatOrInt(v: any) {
  if (v === null || v === undefined) return false;
  if (typeof v === "number") return !Number.isNaN(v) && Number.isFinite(v);
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(",", "."));
    return !Number.isNaN(n) && Number.isFinite(n);
  }
  return false;
}
function toNumber(v: any) {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v.replace(",", "."));
  return NaN;
}
function isInteger(v: any) {
  if (!isFloatOrInt(v)) return false;
  const n = toNumber(v);
  return Number.isInteger(n);
}
function isInHamburg(
  coords: { lon: number; lat: number } | null,
  display?: string
) {
  if (
    coords &&
    typeof coords.lon === "number" &&
    typeof coords.lat === "number"
  ) {
    const { lon, lat } = coords;
    if (
      lon >= HAMBURG_BBOX.minLon &&
      lon <= HAMBURG_BBOX.maxLon &&
      lat >= HAMBURG_BBOX.minLat &&
      lat <= HAMBURG_BBOX.maxLat
    ) {
      return true;
    }
  }
  if (display && /hamburg/i.test(display)) return true;
  return false;
}

const AddressSearchWizardPage = () => {
  const [step, setStep] = useState(0);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [textInput, setTextInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [addressCoords, setAddressCoords] = useState<{
    lon: number;
    lat: number;
  } | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [shouldSaveAfterLogin, setShouldSaveAfterLogin] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValError[]>([]);

  // Lade-/Fehlerzustände fürs Speichern
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSavingInfo, setShowSavingInfo] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const current = questions[step];

  const startEditStep = (index: number) => {
    setEditingStep(index);
    setStep(index);
    const q = questions[index];
    const prev = answers[q.key];
    if (q.options === "text") {
      setTextInput(prev ?? "");
    } else if (q.options === "address") {
      setAddressInput(prev?.display ?? "");
      setAddressCoords(prev?.coords ?? null);
    }
  };

  const handleNext = (value?: any) => {
    if (current.options === "text") {
      setAnswers((prev) => ({ ...prev, [current.key]: textInput }));
      setTextInput("");
    } else if (current.options === "address") {
      setAnswers((prev) => ({
        ...prev,
        [current.key]: { display: addressInput, coords: addressCoords },
      }));
      setAddressInput("");
    } else {
      setAnswers((prev) => ({ ...prev, [current.key]: value }));
    }

    if (editingStep !== null) {
      setEditingStep(null);
      setStep(questions.length);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  // Nur Navigation zwischen Fragen (ohne Speichern der aktuellen Eingabe)
  const goPrev = () => setStep((s) => Math.max(0, s - 1));
  const goNext = () => setStep((s) => Math.min(questions.length - 1, s + 1));

  const validate = (a: AnswerMap): ValError[] => {
    const errs: ValError[] = [];

    const addr = a.address;
    const isHH = isInHamburg(addr?.coords ?? null, addr?.display);
    if (!addr || !isHH) {
      errs.push({
        key: "address",
        message:
          "Adresse muss in Hamburg liegen (Hinweis: wähle eine Adresse in Hamburg; Koordinaten oder Text „Hamburg“).",
      });
    }

    if (!isFloatOrInt(a.cutoff)) {
      errs.push({
        key: "cutoff",
        message:
          "Anreisezeit (cutoff) muss eine Zahl (Integer oder Float) sein, z. B. 30 oder 30.5.",
      });
    }

    if (!isInteger(a.houseNumber)) {
      errs.push({
        key: "houseNumber",
        message: "Hausnummer muss eine ganze Zahl sein, z. B. 12.",
      });
    }

    if (!isFloatOrInt(a.speed)) {
      errs.push({
        key: "speed",
        message:
          "Geschwindigkeit (speed) muss eine Zahl (Integer oder Float) sein, z. B. 5 oder 12.5.",
      });
    }

    return errs;
  };

  const normalizedAnswers = useMemo(() => {
    const na: AnswerMap = { ...answers };
    if (answers.cutoff !== undefined) na.cutoff = toNumber(answers.cutoff);
    if (answers.houseNumber !== undefined)
      na.houseNumber = parseInt(
        String(answers.houseNumber).replace(",", "."),
        10
      );
    if (answers.speed !== undefined) na.speed = toNumber(answers.speed);
    return na;
  }, [answers]);

  const allAnswered = useMemo(
    () => questions.every((q) => answers[q.key]),
    [answers]
  );

  const handleSaveForLoggedInUser = async () => {
    if (!allAnswered || hasSubmitted || !user?.id || !user?.token) return;

    const errs = validate(answers);
    if (errs.length) {
      setValidationErrors(errs);
      return;
    }
    setValidationErrors([]);

    try {
      setIsSaving(true);
      setShowSavingInfo(true);
      setSaveError(null);

      await submitSearchRequest(normalizedAnswers, user.token, user.id);

      setHasSubmitted(true);

      setShowSavingInfo(false);
      navigate("/found-jobs?mode=customVisible");
    } catch (err) {
      console.error("❌ Fehler beim Speichern des Suchauftrags", err);
      setSaveError("Speichern fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveForGuestUser = () => {
    const errs = validate(answers);
    if (errs.length) {
      setValidationErrors(errs);
      return;
    }
    setValidationErrors([]);

    setShowSavingInfo(true);
    setTimeout(() => {
      setShowSavingInfo(false);
      setSaved(true);
      setShouldSaveAfterLogin(true);
    }, 600);
  };

  useEffect(() => {
    if (
      shouldSaveAfterLogin &&
      user?.id &&
      user?.token &&
      questions.every((q) => answers[q.key]) &&
      !hasSubmitted
    ) {
      handleSaveForLoggedInUser();
      setShouldSaveAfterLogin(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.token, shouldSaveAfterLogin]);

  return (
    <>
      <AppHeader />
      <Box sx={{ minHeight: "100vh", backgroundColor: "#fff", py: 8 }}>
        <Stack alignItems="center" spacing={4}>
          {validationErrors.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "error.light",
                backgroundColor: "error.lighter",
                p: 2,
                maxWidth: 700,
                width: "100%",
              }}
            >
              <Alert severity="error" variant="outlined" sx={{ mb: 1 }}>
                Bitte korrigiere die folgenden Felder:
              </Alert>
              <List dense>
                {validationErrors.map((e) => (
                  <ListItem key={e.key} sx={{ py: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          <strong>
                            {questions.find((q) => q.key === e.key)?.text ??
                              e.key}
                            :
                          </strong>{" "}
                          {e.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {step < questions.length ? (
            <>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ width: "100%", maxWidth: 600, justifyContent: "center" }}
              >
                <IconButton
                  aria-label="Zurück"
                  onClick={goPrev}
                  disabled={step === 0}
                  size="small"
                >
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>

                <Typography variant="body2" color="primary">
                  Schritt {step + 1} von {questions.length}
                </Typography>

                <IconButton
                  aria-label="Weiter"
                  onClick={goNext}
                  disabled={step === questions.length - 1}
                  size="small"
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Typography variant="h5" fontWeight={600} textAlign="center">
                {current.text}
              </Typography>

              <Stack spacing={2} width="100%" maxWidth={500}>
                {Array.isArray(current.options) ? (
                  current.options.map((option) => (
                    <Paper
                      key={option}
                      variant="outlined"
                      sx={{
                        p: 2,
                        textAlign: "center",
                        borderRadius: 2,
                        cursor: "pointer",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                      onClick={() => handleNext(option)}
                    >
                      <Typography color="primary" fontWeight={500}>
                        {option}
                      </Typography>
                    </Paper>
                  ))
                ) : current.options === "address" ? (
                  <>
                    <AddressAutocomplete
                      value={addressInput}
                      setValue={setAddressInput}
                      onSelectLocation={setAddressCoords}
                    />
                    <Button
                      variant="contained"
                      disabled={!addressInput || !addressCoords}
                      onClick={() => handleNext()}
                    >
                      Weiter
                    </Button>
                  </>
                ) : current.options === "text" ? (
                  <>
                    <TextField
                      fullWidth
                      label="Eingabe"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      disabled={!textInput}
                      onClick={() => handleNext()}
                    >
                      Weiter
                    </Button>
                  </>
                ) : null}
              </Stack>
            </>
          ) : !saved ? (
            <>
              <Typography variant="h5" fontWeight={600} textAlign="center">
                Deine Angaben im Überblick
              </Typography>

              <Stack spacing={2} width="100%" maxWidth={500}>
                {questions.map((q, index) => (
                  <Paper
                    key={q.key}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {q.text}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {typeof answers[q.key] === "object"
                          ? answers[q.key]?.display
                          : answers[q.key]}
                      </Typography>
                    </Box>
                    <EditIcon
                      sx={{ cursor: "pointer", color: "primary.main" }}
                      onClick={() => startEditStep(index)}
                    />
                  </Paper>
                ))}
              </Stack>

              <Button
                variant="contained"
                sx={{ mt: 4 }}
                onClick={() => {
                  if (user?.id && user?.token) {
                    handleSaveForLoggedInUser();
                  } else {
                    handleSaveForGuestUser();
                  }
                }}
                disabled={!allAnswered || isSaving}
                startIcon={
                  isSaving ? <CircularProgress size={18} /> : undefined
                }
              >
                {isSaving ? "Speichern…" : "Speichern"}
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h5" fontWeight={600} textAlign="center">
                Willkommen!
              </Typography>
              <Typography color="text.secondary" textAlign="center">
                Starte jetzt in dein persönliches Dashboard.
              </Typography>

              <Stack
                spacing={2}
                mt={4}
                alignItems="center"
                sx={{ width: "100%" }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/dashboard")}
                  fullWidth
                  sx={{ maxWidth: 300 }}
                >
                  Anmelden
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/dashboard")}
                  fullWidth
                  sx={{ maxWidth: 300 }}
                >
                  Registrieren
                </Button>
              </Stack>

              <Paper
                elevation={0}
                sx={{
                  mt: 4,
                  p: 2,
                  maxWidth: 600,
                  width: "100%",
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Was macht diese App?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  [Platzhalter] Hier kommt eine kurze Beschreibung deiner App
                  hin: wie man Suchaufträge anlegt, Jobs findet und sie auf der
                  Karte sieht. 2–3 Sätze reichen.
                </Typography>
              </Paper>
            </>
          )}
        </Stack>
      </Box>

      <Backdrop
        open={isSaving}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="inherit" />
          <Typography variant="body2">Speichere Suchauftrag…</Typography>
        </Stack>
      </Backdrop>

      <Snackbar
        open={showSavingInfo}
        message="Speichervorgang gestartet…"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={1500}
        onClose={() => setShowSavingInfo(false)}
      />

      <Snackbar
        open={!!saveError}
        onClose={() => setSaveError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={4000}
      >
        <Alert severity="error" onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddressSearchWizardPage;
