import { Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/UI/AppHeader";
const DashboardPage = () => {
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
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={600}>
          Willkommen in deinem Dashboard!
        </Typography>
        <Typography color="text.secondary">
          Hier siehst du bald passende Jobs basierend auf deinen Angaben.
        </Typography>
      </Box>
    </>
  );
};

export default DashboardPage;
