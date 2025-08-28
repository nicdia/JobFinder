import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
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
  const { login, postLoginRedirect, setPostLoginRedirect } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    setEmailError("");
    setFormError("");

    if (!name || !email || !password || !repeatPassword) {
      setFormError("Bitte fülle alle Felder aus.");
      return;
    }
    if (password !== repeatPassword) {
      setFormError("Passwörter stimmen nicht überein.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await registerUser(name, email, password);

      if (!res.id || !res.token) {
        throw new Error("Ungültige Registrierungsdaten vom Server");
      }

      login({ id: res.id, name: res.name ?? "", token: res.token });

      onClose();

      if (postLoginRedirect) {
        const target = postLoginRedirect;
        setPostLoginRedirect(null);
        navigate(target);
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (
        err?.code === "EMAIL_TAKEN" ||
        err?.status === 409 ||
        /bereits registriert|exists|duplicate/i.test(
          String(err?.message ?? err?.data ?? "")
        )
      ) {
        setEmailError("Diese E-Mail ist bereits registriert.");
      } else {
        setFormError(
          "Registrierung fehlgeschlagen. Bitte später erneut versuchen."
        );
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Registrieren</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {formError && (
            <Typography variant="body2" color="error">
              {formError}
            </Typography>
          )}

          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />

          <TextField
            label="E-Mail"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
            }}
            error={!!emailError}
            helperText={emailError || ""}
            disabled={submitting}
          />

          <TextField
            label="Passwort"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />

          <TextField
            label="Passwort wiederholen"
            type="password"
            fullWidth
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            disabled={submitting}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Abbrechen
        </Button>
        <Button
          variant="contained"
          onClick={handleRegister}
          disabled={submitting}
        >
          {submitting ? "Registriere…" : "Registrieren"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterDialog;
