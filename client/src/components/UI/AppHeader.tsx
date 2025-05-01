import {
  AppBar,
  Toolbar,
  Typography,
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
import { useState } from "react";
import AddressAutocomplete from "./AddressAutocomplete";

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
            <Typography variant="h6" component="div">
              Jobfinder
            </Typography>
            <Button color="inherit">Home</Button>
            <Button color="inherit" onClick={handleOpen}>
              Job suchen
            </Button>
          </Stack>
          <Box>
            <Button color="inherit">Anmelden</Button>
          </Box>
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
    </>
  );
};

export default AppHeader;
