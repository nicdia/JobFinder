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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import AppHeader from "../components/UI/AppHeaderComponent";
import LoginDialog from "../components/UI/LoginDialogComponent";
import RegisterDialog from "../components/UI/RegisterDialogComponent";
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
    options: ["Software Engineering", "Data Engineering", "GIS"],
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
    options: ["Zu Fuß", "Radverkehr", "ÖPNV"],
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
  // Fallback: Text enthält „Hamburg“
  if (display && /hamburg/i.test(display)) return true;
  return false;
}

const OnboardingPageEmployee = () => {
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
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [shouldSaveAfterLogin, setShouldSaveAfterLogin] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValError[]>([]);

  const navigate = useNavigate();
  const { user, setPostLoginRedirect } = useAuth();

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
        [current.key]: {
          display: addressInput,
          coords: addressCoords,
        },
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

  // ---- VALIDIERUNG ----
  const validate = (a: AnswerMap): ValError[] => {
    const errs: ValError[] = [];

    // Address in Hamburg
    const addr = a.address;
    const isHH = isInHamburg(addr?.coords ?? null, addr?.display);
    if (!addr || !isHH) {
      errs.push({
        key: "address",
        message:
          "Adresse muss in Hamburg liegen (Hinweis: wähle eine Adresse in Hamburg; Koordinaten oder Text „Hamburg“).",
      });
    }

    // cutoff: float/integer
    if (!isFloatOrInt(a.cutoff)) {
      errs.push({
        key: "cutoff",
        message:
          "Anreisezeit (cutoff) muss eine Zahl (Integer oder Float) sein, z. B. 30 oder 30.5.",
      });
    }

    // houseNumber: integer
    if (!isInteger(a.houseNumber)) {
      errs.push({
        key: "houseNumber",
        message: "Hausnummer muss eine ganze Zahl sein, z. B. 12.",
      });
    }

    // speed: float/integer
    if (!isFloatOrInt(a.speed)) {
      errs.push({
        key: "speed",
        message:
          "Geschwindigkeit (speed) muss eine Zahl (Integer oder Float) sein, z. B. 5 oder 12.5.",
      });
    }

    return errs;
  };

  // Für den Submit: numerische Felder normalisieren
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
      await submitSearchRequest(normalizedAnswers, user.token, user.id);
      setHasSubmitted(true);
      navigate("/found-jobs?mode=customVisible");
    } catch (err) {
      console.error("❌ Fehler beim Speichern des Suchauftrags", err);
    }
  };

  const handleSaveForGuestUser = () => {
    // vor dem Umschwenken auf Login/Register validieren:
    const errs = validate(answers);
    if (errs.length) {
      setValidationErrors(errs);
      return;
    }
    setValidationErrors([]);

    setSaved(true);
    setShouldSaveAfterLogin(true);
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
          {/* Dynamische Validierungs-Meldungen */}
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
              <Typography variant="body2" color="primary">
                Schritt {step + 1} von {questions.length}
              </Typography>

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
                disabled={!allAnswered}
              >
                Speichern
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h5" fontWeight={600} textAlign="center">
                Fast geschafft!
              </Typography>
              <Typography color="text.secondary" textAlign="center">
                Nur noch ein Schritt bis zu den Jobs:
              </Typography>

              <Stack spacing={2} mt={4} alignItems="center">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setPostLoginRedirect("/onboarding?triggerSave=true");
                    setLoginOpen(true);
                  }}
                  fullWidth
                  sx={{ maxWidth: 300 }}
                >
                  Anmelden
                </Button>
                <Typography color="text.secondary">oder</Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setPostLoginRedirect(
                      "/onboarding-employee?triggerSave=true"
                    );
                    setRegisterOpen(true);
                  }}
                  fullWidth
                  sx={{ maxWidth: 300 }}
                >
                  Registrieren
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Box>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </>
  );
};

export default OnboardingPageEmployee;
