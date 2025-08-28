// src/pages/LandingPage.tsx
import { Box, Button, Stack, Typography, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginDialog from "../components/UI/LoginDialogComponent";
import RegisterDialog from "../components/UI/RegisterDialogComponent";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      navigate("/dashboard");
    }
  }, [user?.id, navigate]);

  return (
    <>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#fff", py: 8 }}>
        <Stack alignItems="center" spacing={3}>
          <Typography variant="h4" fontWeight={700} textAlign="center">
            JobFinder – die Jobsuche mit Karte
          </Typography>
          <Typography
            color="text.secondary"
            textAlign="center"
            sx={{ maxWidth: 800 }}
          >
            JobFinder hilft dir, passende Stellen in deiner Umgebung zu
            entdecken – ganz flexibel und auf dich zugeschnitten.
          </Typography>

          <Stack
            spacing={2}
            direction="column"
            sx={{ width: "100%", maxWidth: 320, mt: 1 }}
          >
            <Button variant="outlined" onClick={() => setLoginOpen(true)}>
              Anmelden
            </Button>
            <Button variant="contained" onClick={() => setRegisterOpen(true)}>
              Registrieren
            </Button>
          </Stack>

          {/* Feature-Block */}
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 3,
              maxWidth: 800,
              width: "100%",
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="body1">
                <strong>Personalisierte Suche:</strong> Beantworte ein paar
                Fragen zu Berufsfeld, gewünschter Anreisezeit und
                Transportmittel. Du kannst eine Adresse eingeben oder direkt auf
                der Karte ein Gebiet oder eine Route zeichnen.
              </Typography>

              <Typography variant="body1">
                <strong>Intelligente Erreichbarkeitszonen:</strong> Auf Basis
                deiner Angaben berechnet die App realistische Reisezeit-Polygone
                und zeigt dir sofort, welche Jobs innerhalb dieser Zone liegen.
              </Typography>

              <Typography variant="body1">
                <strong>Interaktive Kartenansicht:</strong> Durchstöbere alle
                offenen Stellen auf einer übersichtlichen Karte, rufe Details zu
                einzelnen Angeboten ab und steuere bequem zwischen eigenen
                Suchgebieten, allgemeinen Angeboten und bereits gespeicherten
                Jobs.
              </Typography>

              <Typography variant="body1">
                <strong>Anmelden &amp; Speichern:</strong> Mit einem Konto
                lassen sich Suchaufträge sichern, interessante Angebote
                vormerken und später erneut aufrufen. Dein Profil sowie
                gespeicherte Daten kannst du jederzeit aktualisieren oder
                löschen.
              </Typography>

              <Typography variant="body1">
                <strong>Aktuelle Jobdaten:</strong> Die Stellenausschreibungen
                werden aus verschiedenen Quellen zusammengestellt und
                geokodiert, damit die Ortsangaben verlässlich stimmen.
              </Typography>
            </Stack>

            <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
              Entdecke jetzt, welche beruflichen Möglichkeiten in deiner Nähe
              auf dich warten – flexibel, visuell und ganz nach deinen
              Bedürfnissen.
            </Typography>
          </Paper>
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

export default LandingPage;
