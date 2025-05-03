import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Typography as MuiTypography,
  TextField,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import AddressAutocomplete from "./AddressAutocompleteComponent";
import LoginDialog from "./LoginDialogComponent";
import RegisterDialog from "./RegisterDialogComponent";
import AccountMenu from "./AccountMenuComponent";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AppHeader = ({
  setDrawType,
  setIsDrawMode,
  searchOpen,
  setSearchOpen,
  searchMode,
  setSearchMode,
}: {
  setDrawType: (type: string | null) => void;
  setIsDrawMode: (mode: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (val: boolean) => void;
  searchMode: "accessibility" | "customArea" | null;
  setSearchMode: (val: "accessibility" | "customArea" | null) => void;
}) => {
  const [accessibilityAddress, setAccessibilityAddress] = useState("");
  const [accessibilityCoords, setAccessibilityCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [houseNumber, setHouseNumber] = useState("");
  const [transportMode, setTransportMode] = useState<
    "foot" | "bike" | "transit" | null
  >(null);
  const [travelTime, setTravelTime] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOpen = () => setSearchOpen(true);

  const handleClose = () => {
    setSearchMode(null);
    setAccessibilityAddress("");
    setAccessibilityCoords(null);
    setHouseNumber("");
    setSearchOpen(false);
  };

  const handleSearch = () => {
    if (searchMode === "customArea") {
      setIsDrawMode(true);
      setDrawType("Polygon");
    }

    if (searchMode === "accessibility") {
      if (!accessibilityCoords) {
        alert("Bitte wähle eine gültige Adresse aus der Liste.");
        return;
      }
      console.log("🔍 Suche mit:", {
        adresse: accessibilityAddress,
        hausnummer: houseNumber,
        coords: accessibilityCoords,
      });
    }

    handleClose();
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* 🧭 Work Icon führt zur Startseite */}
            <IconButton
              color="inherit"
              onClick={() => navigate(user ? "/dashboard" : "/")}
              sx={{ "& svg": { fontSize: 28 } }}
            >
              <HomeIcon />
            </IconButton>

            {user && (
              <Button color="inherit" onClick={handleOpen}>
                Suchbereich erstellen
              </Button>
            )}
          </Stack>

          {/* 🔐 Auth Buttons oder AccountMenu */}
          {!user ? (
            <Stack direction="row" spacing={1}>
              <Button color="inherit" onClick={() => setLoginOpen(true)}>
                Anmelden
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setRegisterOpen(true)}
                sx={{
                  borderColor: "white",
                  color: "white",
                  outline: "none",
                  "&:focus": { outline: "none" },
                  "&.Mui-focusVisible": { boxShadow: "none" },
                }}
              >
                Registrieren
              </Button>
            </Stack>
          ) : (
            <AccountMenu />
          )}
        </Toolbar>
      </AppBar>

      <Dialog open={searchOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Job suchen</DialogTitle>
        <DialogContent>
          <ToggleButtonGroup
            value={searchMode}
            exclusive
            onChange={(_, value) => {
              if (value === "customArea") {
                setIsDrawMode(true);
                setDrawType("Polygon");
                setSearchOpen(false);
              }
              setSearchMode(value);
            }}
            fullWidth
            sx={{ my: 2 }}
          >
            <ToggleButton value="accessibility">
              Suche mit Erreichbarkeitsparametern
            </ToggleButton>
            <ToggleButton value="customArea">
              Setze eigenen Suchbereich
            </ToggleButton>
          </ToggleButtonGroup>

          {searchMode === "accessibility" && (
            <Stack spacing={2} mt={2}>
              <MuiTypography variant="body2" color="text.secondary">
                Gib deinen Startpunkt an.
              </MuiTypography>

              <Box
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": accessibilityCoords
                    ? {
                        borderColor: "green",
                        borderWidth: 2,
                      }
                    : {},
                }}
              >
                <AddressAutocomplete
                  value={accessibilityAddress}
                  setValue={setAccessibilityAddress}
                  onSelectLocation={(coords) => {
                    setAccessibilityCoords(coords);
                  }}
                />
              </Box>

              {accessibilityCoords && (
                <Box
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": houseNumber
                      ? {
                          borderColor: "green",
                          borderWidth: 2,
                        }
                      : {},
                  }}
                >
                  <TextField
                    fullWidth
                    label="Hausnummer"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                  />
                </Box>
              )}
              {accessibilityCoords && houseNumber && (
                <>
                  <MuiTypography variant="body2" color="text.secondary">
                    Berechne Erreichbarkeit mit folgendem Transportmittel ...
                  </MuiTypography>

                  <ToggleButtonGroup
                    value={transportMode}
                    exclusive
                    onChange={(_, value) => {
                      if (value !== null) setTransportMode(value);
                    }}
                    fullWidth
                    color="primary"
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="foot">Zu Fuß</ToggleButton>
                    <ToggleButton value="bike">Radverkehr</ToggleButton>
                    <ToggleButton value="transit">ÖPNV</ToggleButton>
                  </ToggleButtonGroup>

                  {transportMode && (
                    <>
                      <TextField
                        type="number"
                        fullWidth
                        label={`Zeige Jobs, welche mit dem ${
                          transportMode === "foot"
                            ? "Fußweg"
                            : transportMode === "bike"
                            ? "Fahrrad"
                            : "ÖPNV"
                        } in ... Minuten zu erreichen sind`}
                        value={travelTime}
                        onChange={(e) => setTravelTime(e.target.value)}
                      />
                    </>
                  )}
                </>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Abbrechen</Button>
          <Button
            onClick={handleSearch}
            variant="contained"
            disabled={
              !searchMode ||
              (searchMode === "accessibility" &&
                (!accessibilityAddress ||
                  !accessibilityCoords ||
                  !houseNumber ||
                  !transportMode ||
                  !travelTime))
            }
            sx={{
              opacity:
                !searchMode ||
                (searchMode === "accessibility" &&
                  (!accessibilityAddress ||
                    !accessibilityCoords ||
                    !houseNumber ||
                    !transportMode ||
                    !travelTime))
                  ? 0.4
                  : 1,
              pointerEvents:
                !searchMode ||
                (searchMode === "accessibility" &&
                  (!accessibilityAddress ||
                    !accessibilityCoords ||
                    !houseNumber ||
                    !transportMode ||
                    !travelTime))
                  ? "none"
                  : "auto",
            }}
          >
            Suchen
          </Button>
        </DialogActions>
      </Dialog>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </>
  );
};

export default AppHeader;
