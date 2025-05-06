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
    text: "Willst du Teilzeit oder Vollzeit arbeiten?",
    options: ["Teilzeit", "Vollzeit"],
  },
  {
    key: "sector",
    text: "In welchem Bereich möchtest du arbeiten?",
    options: ["IT", "Pflege", "Handwerk", "Gastronomie"],
  },
  {
    key: "commuteRange",
    text: "Wie weit darf der Arbeitsweg sein?",
    options: ["Bis 15 Minuten", "15–30 Minuten", "Mehr als 30 Minuten"],
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
  {
    key: "maxTime",
    text: "Wie viele Minuten darf dein Arbeitsweg maximal dauern?",
    options: ["5", "10", "15", "30", "45"],
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

  const navigate = useNavigate();
  const { user } = useAuth();

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

  useEffect(() => {
    const saveAndRedirect = async () => {
      const allAnswered = questions.every((q) => answers[q.key]);
      if (user && saved && allAnswered && !hasSubmitted) {
        try {
          await submitSearchRequest(answers, user.token);
          setHasSubmitted(true);
          navigate("/save-success");
        } catch (err) {
          console.error("❌ Fehler beim Speichern des Suchauftrags", err);
        }
      }
    };

    saveAndRedirect();
  }, [user, saved, answers, hasSubmitted]); // beachte: hasSubmitted hinzugefügt

  console.log("🔁 useEffect triggered", { user, saved, answers });

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
                  if (user) {
                    setSaved(true); // useEffect erledigt Rest
                  } else {
                    setSaved(true); // zeigt Login/Registrierung
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
                  onClick={() => setLoginOpen(true)}
                  fullWidth
                  sx={{ maxWidth: 300 }}
                >
                  Anmelden
                </Button>
                <Typography color="text.secondary">oder</Typography>
                <Button
                  variant="contained"
                  onClick={() => setRegisterOpen(true)}
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
