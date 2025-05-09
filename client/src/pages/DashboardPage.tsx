import { Box, Container, Typography, Divider } from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AppsIcon from "@mui/icons-material/Apps";
import { useAuth } from "../context/AuthContext";
import AppHeader from "../components/UI/AppHeaderComponent";
import SearchIcon from "@mui/icons-material/Search"; // oben ergänzen
import BarChartIcon from "@mui/icons-material/BarChart";
import { useNavigate } from "react-router-dom";
import DashboardSection from "../components/UI/DashboardSectionComponent"; // Navigation

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      <Box
        sx={{
          py: 4,
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          px: 2, // ⬅️ Seitenabstand!
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h5" fontWeight={600}>
            Hallo {user?.name || "Nutzer"},
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Hier ist deine Jobsuche im Überblick.
          </Typography>
        </Container>
        <Divider sx={{ my: 2 }} />
        <DashboardSection
          icon={
            <WorkOutlineIcon sx={{ fontSize: 40, color: "primary.main" }} />
          }
          title="Meine neusten Jobempfehlungen"
          description="Basierend auf deinem Suchverlauf erstellen wir Empfehlungen. Suche nach Jobs, um personalisierte Vorschläge zu erhalten."
          buttonLabel="Anzeigen"
          onClick={() => navigate("/map?mode=customVisible")}
        />

        <Divider sx={{ my: 2 }} />
        <DashboardSection
          icon={
            <FavoriteBorderIcon sx={{ fontSize: 40, color: "primary.main" }} />
          }
          title="Keine gespeicherten Jobs"
          description="Hier siehst du eine Übersicht der Jobs, die du mit einem Herz markiert hast."
          buttonLabel="Anzeigen"
          onClick={() => console.log("Gespeicherte Jobs")}
        />
        <Divider sx={{ my: 2 }} />
        <DashboardSection
          icon={<AppsIcon sx={{ fontSize: 40, color: "primary.main" }} />}
          title="Alle Jobs"
          description="Du willst einfach mal alle Jobs ungefiltert ansehen? Kicke hier."
          buttonLabel="Anzeigen"
          onClick={() => navigate("/map?mode=all")}
        />
        <Divider sx={{ my: 2 }} />
        <DashboardSection
          icon={<SearchIcon sx={{ fontSize: 40, color: "primary.main" }} />}
          title="Jobs per Adresse suchen"
          description="Erstelle hier einen neuen Suchauftrag basierend auf den Erreichbarkeitsverhältnissen deiner Adresse."
          buttonLabel="Erstellen"
          onClick={() => navigate("/onboarding")}
        />
        <Divider sx={{ my: 2 }} />
        <DashboardSection
          icon={<SearchIcon sx={{ fontSize: 40, color: "primary.main" }} />}
          title="Suchgebiet/-Ort einzeichnen"
          description="Zeichne hier ein, in welchem Bereich du Jobs angezeigt bekommen möchtest."
          buttonLabel="Zeichnen"
          onClick={() => navigate("/draw-search")}
        />
        <Divider sx={{ my: 2 }} />
        <DashboardSection
          icon={<BarChartIcon sx={{ fontSize: 40, color: "primary.main" }} />}
          title="Statistiken"
          description="Hier kannst du dir Statistiken vergangener Jobangebote anschauen."
          buttonLabel="Anzeigen"
          onClick={() => console.log("Gespeicherte Jobs")}
        />
        <Divider sx={{ my: 2 }} />
      </Box>
    </>
  );
};

export default DashboardPage;
