import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Stack } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const SaveSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        textAlign: "center",
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CheckCircleOutlineIcon sx={{ color: "green", fontSize: 80 }} />
        <Typography variant="h5" fontWeight={600}>
          Speichern erfolgreich
        </Typography>
        <Typography color="text.secondary">
          Du wirst gleich weitergeleitet...
        </Typography>
        <CircularProgress size={24} color="success" />
      </Stack>
    </Box>
  );
};

export default SaveSuccessPage;
