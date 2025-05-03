import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { registerUser } from "../../services/authApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const RegisterDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password || !repeatPassword) {
      alert("Bitte fülle alle Felder aus.");
      return;
    }

    if (password !== repeatPassword) {
      alert("Passwörter stimmen nicht überein");
      return;
    }

    try {
      const userData = await registerUser(name, email, password);
      login(userData);
      onClose();
      navigate("/dashboard");
    } catch (err) {
      alert("Registrierung fehlgeschlagen");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Registrieren</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="E-Mail"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Passwort"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Passwort wiederholen"
            type="password"
            fullWidth
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={handleRegister}>
          Registrieren
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterDialog;
