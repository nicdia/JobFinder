import { Box, Button, Container, Stack, Typography } from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/UI/AppHeader";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <AppHeader
        // Dummy-Funktionen, weil auf der Landing Page kein Map-Context notwendig ist
        setDrawType={() => {}}
        setIsDrawMode={() => {}}
        searchOpen={false}
        setSearchOpen={() => {}}
        searchMode={null}
        setSearchMode={() => {}}
      />
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: 8 }}>
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <WorkOutlineIcon sx={{ fontSize: 60, color: "primary.main" }} />
            <Typography variant="h3" component="h1">
              Willkommen bei Jobfinder
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Finde den passenden Job in deiner Nähe – basierend auf deinem
              Standort und deiner Erreichbarkeit.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={() => navigate("/onboarding")}
              >
                Suchen als Arbeitnehmer
              </Button>
              <Button variant="contained" onClick={() => navigate("/")}>
                Inserieren als Arbeitgeber
              </Button>
              <Button variant="contained" onClick={() => navigate("/")}>
                Zeige Alle Jobs
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;
