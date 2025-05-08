import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AppHeader from "../components/UI/AppHeaderComponent";
import LoginDialog from "../components/UI/LoginDialogComponent";
import RegisterDialog from "../components/UI/RegisterDialogComponent";
import AddressAutocomplete from "../components/UI/AddressAutocompleteComponent";
import { useAuth } from "../context/AuthContext";
import { submitSearchRequest } from "../services/searchRequestApi";

const questions = [
  {
    key: "jobType",
    text: "In welchem Bereich möchtest du arbeiten?",
    options: ["Software Engineering", "AI/Data", "Projektmanagement"],
  },
  {
    key: "commuteRange",
    text: "Wie viele Minuten darf dein Arbeitsweg maximal dauern?",
    options: ["5", "10", "15", "30", "45", "60", "90"],
  },
  {
    key: "address",
    text: "Wie lautet deine Startadresse?",
    options: "address",
  },
  {
    key: "houseNumber",
    text: "Wie lautet deine Hausnummer?",
    options: "text",
  },
  {
    key: "transport",
    text: "Welches Transportmittel möchtest du nutzen?",
    options: ["Zu Fuß", "Radverkehr", "ÖPNV"],
  },
];

const OnboardingPageEmployee = () => {
  const [step, setStep] = useState(0);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [textInput, setTextInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [addressCoords, setAddressCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [shouldSaveAfterLogin, setShouldSaveAfterLogin] = useState(false);

  const navigate = useNavigate();
  const { user, setPostLoginRedirect } = useAuth();

  const current = questions[step];

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
      setEditingStep(null); // zurück zur Übersicht
      setStep(questions.length);
    } else {
      setStep((prev) => prev + 1);
    }
  };
  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  const saveAndRedirect = async (
    user: any,
    answers: any,
    saved: boolean,
    hasSubmitted: boolean,
    setHasSubmitted: (v: boolean) => void,
    navigate: (path: string) => void
  ) => {
    console.log("save and redirect is triggered");

    const allAnswered = questions.every((q) => answers[q.key]);
    if (user?.id && user?.token && saved && allAnswered && !hasSubmitted) {
      try {
        console.log(
          `this is answers ${answers}, this is token ${user.token} and this is ${user.id} `
        );
        await submitSearchRequest(answers, user.token, user.id); // ✅
        setHasSubmitted(true);
        navigate("/save-success");
      } catch (err) {
        console.error("❌ Fehler beim Speichern des Suchauftrags", err);
      }
    }
  };

  const handleSaveForLoggedInUser = async () => {
    const allAnswered = questions.every((q) => answers[q.key]);
    if (!allAnswered || hasSubmitted || !user?.id || !user?.token) return;

    try {
      await submitSearchRequest(answers, user.token, user.id);
      setHasSubmitted(true);
      navigate("/save-success");
    } catch (err) {
      console.error("❌ Fehler beim Speichern des Suchauftrags", err);
    }
  };

  const handleSaveForGuestUser = () => {
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
      // Sofort speichern
      handleSaveForLoggedInUser();
      setShouldSaveAfterLogin(false); // Nur einmal speichern
    }
  }, [user?.id, user?.token, shouldSaveAfterLogin]);

  return (
    <>
      <AppHeader
        setDrawType={() => {}}
        setIsDrawMode={() => {}}
        searchOpen={false}
        setSearchOpen={() => {}}
        searchMode={null}
        setSearchMode={() => {}}
      />

      <Box sx={{ minHeight: "100vh", backgroundColor: "#fff", py: 8 }}>
        <Stack alignItems="center" spacing={4}>
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
                      onClick={() => setStep(index)}
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
                disabled={!questions.every((q) => answers[q.key])}
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
                    setPostLoginRedirect(
                      "/onboarding-employee?triggerSave=true"
                    );
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
