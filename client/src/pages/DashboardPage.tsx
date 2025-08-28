// src/pages/DashboardPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Stack,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AppsIcon from "@mui/icons-material/Apps";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardSection from "../components/UI/DashboardSectionComponent";
import FeatureDialog from "../components/Map/FeatureDetailsDialogComponent";

// Services – bestehend
import { fetchUserSearchRequests } from "../services/fetchAddressRequest";
import { fetchDrawnRequests } from "../services/fetchDrawnRequest";
import { deleteAddressRequest } from "../services/deleteAdressRequest";
import { deleteDrawnRequest } from "../services/deleteDrawnRequest";

// Services – Saved Jobs
import { fetchUserSavedJobs, deleteUserSavedJob } from "../services/savedJobs";

// Services – Counts für Found/All Jobs
import { fetchUserVisibleJobs } from "../services/fetchUserVisibleJobs";
import { fetchAllJobs } from "../services/fetchAllJobsApi";
import TextField from "@mui/material/TextField";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

import {
  updateUserProfile,
  deleteUserAccount,
} from "../services/userManagement";

type AnyFeature = {
  id?: number | string;
  type: "Feature";
  geometry?: any;
  properties?: Record<string, any>;
};

type UnifiedRequest = {
  id: number | string;
  type: "address" | "drawn";
  name: string;
  createdAt?: string;
  jobType?: string;
  raw: AnyFeature;
};

type SavedJob = {
  id: number | string;
  title: string;
  company?: string;
  createdAt?: string;
  externalUrl?: string;
  raw: AnyFeature;
};

function extractFeatures(input: any): AnyFeature[] {
  if (!input) return [];
  if (Array.isArray(input)) return input as AnyFeature[];
  if (input.type === "FeatureCollection" && Array.isArray(input.features)) {
    return input.features as AnyFeature[];
  }
  if (input.type === "Feature") return [input as AnyFeature];
  return [];
}

function pickName(props: Record<string, any> = {}, id: number | string) {
  return (
    props.req_name ??
    props.label ??
    props.title ??
    props.address_display ??
    `Suchauftrag #${id}`
  );
}
// --------------------------------------------

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Accordions: States
  const [expandedReq, setExpandedReq] = useState<boolean>(false);
  const [expandedSaved, setExpandedSaved] = useState<boolean>(false);
  const [expandedFound, setExpandedFound] = useState<boolean>(false);
  const [expandedAll, setExpandedAll] = useState<boolean>(false);

  // Requests laden
  const [loading, setLoading] = useState<boolean>(false);
  const [addrData, setAddrData] = useState<AnyFeature[]>([]);
  const [drawnData, setDrawnData] = useState<AnyFeature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  // Saved Jobs laden
  const [savedLoading, setSavedLoading] = useState<boolean>(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [savedFeatures, setSavedFeatures] = useState<AnyFeature[]>([]);
  const [savedSelected, setSavedSelected] = useState<any | null>(null);
  const [deletingSaved, setDeletingSaved] = useState<Record<string, boolean>>(
    {}
  );

  // Counts: Found / All
  const [foundCount, setFoundCount] = useState<number | null>(null);
  const [foundCountLoading, setFoundCountLoading] = useState<boolean>(false);
  const [foundCountError, setFoundCountError] = useState<string | null>(null);

  const [allCount, setAllCount] = useState<number | null>(null);
  const [allCountLoading, setAllCountLoading] = useState<boolean>(false);
  const [allCountError, setAllCountError] = useState<string | null>(null);

  // Accordion: Account verwalten
  const [expandedAccount, setExpandedAccount] = useState<boolean>(false);

  // Form-State
  const initialEmail =
    (user as any)?.email ??
    (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null")?.email || "";
      } catch {
        return "";
      }
    })();

  const [accEmail, setAccEmail] = useState<string>(initialEmail);
  const [accPassword, setAccPassword] = useState<string>("");

  const [accSaving, setAccSaving] = useState<boolean>(false);
  const [accDeleting, setAccDeleting] = useState<boolean>(false);
  const [accError, setAccError] = useState<string | null>(null);

  // Beim Mount laden (Requests)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [addrResp, drawnResp] = await Promise.all([
          fetchUserSearchRequests(user || undefined),
          fetchDrawnRequests(user || undefined),
        ]);
        if (!alive) return;
        setAddrData(extractFeatures(addrResp));
        setDrawnData(extractFeatures(drawnResp));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Fehler beim Laden der Suchaufträge.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  // Beim Mount laden (Saved Jobs)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setSavedLoading(true);
        setSavedError(null);
        const savedResp = await fetchUserSavedJobs(user || undefined);
        if (!alive) return;
        setSavedFeatures(extractFeatures(savedResp));
      } catch (e: any) {
        if (!alive) return;
        setSavedError(
          e?.message ?? "Fehler beim Laden der gespeicherten Jobs."
        );
      } finally {
        if (alive) setSavedLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  // Counts laden (Found/All)
  useEffect(() => {
    let alive = true;

    // Gefundene Jobs (nur sinnvoll, wenn eingeloggt)
    (async () => {
      if (!user?.id) {
        setFoundCount(null);
        return;
      }
      try {
        setFoundCountLoading(true);
        setFoundCountError(null);
        const fc = await fetchUserVisibleJobs(user);
        if (!alive) return;
        setFoundCount(Array.isArray(fc?.features) ? fc.features.length : 0);
      } catch (e: any) {
        if (!alive) return;
        setFoundCountError(e?.message ?? "Fehler beim Zählen (Gefundene).");
      } finally {
        if (alive) setFoundCountLoading(false);
      }
    })();

    // Alle Jobs
    (async () => {
      try {
        setAllCountLoading(true);
        setAllCountError(null);
        const fc = await fetchAllJobs();
        if (!alive) return;
        setAllCount(Array.isArray(fc?.features) ? fc.features.length : 0);
      } catch (e: any) {
        if (!alive) return;
        setAllCountError(e?.message ?? "Fehler beim Zählen (Alle Jobs).");
      } finally {
        if (alive) setAllCountLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user]);

  // Vereinheitlichte Liste (Requests)
  const requests: UnifiedRequest[] = useMemo(() => {
    const a = addrData.map((f) => {
      const id = (f.id ?? f.properties?.id) as number | string;
      const props = f.properties ?? {};
      return {
        id,
        type: "address" as const,
        name: pickName(props, id),
        createdAt: props.created_at,
        jobType: props.job_type ?? undefined,
        raw: f,
      };
    });

    const d = drawnData.map((f) => {
      const id = (f.id ?? f.properties?.id) as number | string;
      const props = f.properties ?? {};
      return {
        id,
        type: "drawn" as const,
        name: pickName(props, id),
        createdAt: props.created_at,
        jobType: props.job_type ?? undefined,
        raw: f,
      };
    });

    return [...a, ...d];
  }, [addrData, drawnData]);

  // Abgeleitete Liste (Saved Jobs)
  const savedJobs: SavedJob[] = useMemo(() => {
    return savedFeatures.map((f) => {
      const id = (f.id ?? f.properties?.job_id) as number | string;
      const p = f.properties ?? {};
      return {
        id,
        title: p.title ?? `Job #${id}`,
        company: p.company ?? undefined,
        createdAt: p.created_at ?? p.saved_at ?? undefined,
        externalUrl: p.external_url ?? undefined,
        raw: f,
      };
    });
  }, [savedFeatures]);

  // Delete-Handler (Requests)
  const handleDelete = async (r: UnifiedRequest) => {
    const key = `${r.type}-${r.id}`;
    const ok = window.confirm(
      `Möchtest du den Suchauftrag „${r.name}“ wirklich löschen?`
    );
    if (!ok) return;

    try {
      setDeletingIds((s) => ({ ...s, [key]: true }));

      if (r.type === "address") {
        await deleteAddressRequest(Number(r.id), user || undefined);
        setAddrData((prev) =>
          prev.filter((f) => String(f.id ?? f.properties?.id) !== String(r.id))
        );
      } else {
        await deleteDrawnRequest(Number(r.id), user || undefined);
        setDrawnData((prev) =>
          prev.filter((f) => String(f.id ?? f.properties?.id) !== String(r.id))
        );
      }
    } catch (e: any) {
      console.error("Delete request failed:", e);
      alert(
        e?.message
          ? `Löschen fehlgeschlagen: ${e.message}`
          : "Löschen fehlgeschlagen."
      );
    } finally {
      setDeletingIds((s) => {
        const { [key]: _drop, ...rest } = s;
        return rest;
      });
    }
  };

  // Delete-Handler (Saved Jobs)
  const handleDeleteSaved = async (j: SavedJob) => {
    const key = `saved-${j.id}`;
    const ok = window.confirm(
      `Möchtest du den gespeicherten Job „${j.title}“ wirklich entfernen?`
    );
    if (!ok) return;

    try {
      setDeletingSaved((s) => ({ ...s, [key]: true }));
      await deleteUserSavedJob(Number(j.id), user || undefined);
      setSavedFeatures((prev) =>
        prev.filter(
          (f) => String(f.id ?? f.properties?.job_id) !== String(j.id)
        )
      );
    } catch (e: any) {
      console.error("Delete saved job failed:", e);
      alert(
        e?.message
          ? `Löschen fehlgeschlagen: ${e.message}`
          : "Löschen fehlgeschlagen."
      );
    } finally {
      setDeletingSaved((s) => {
        const { [key]: _drop, ...rest } = s;
        return rest;
      });
    }
  };

  const handleSaveAccount = async () => {
    if (!user?.id) {
      setAccError("Nicht eingeloggt.");
      return;
    }

    const payload: { email?: string; password?: string } = {};
    if (accEmail && accEmail !== initialEmail) payload.email = accEmail.trim();
    if (accPassword) payload.password = accPassword;

    if (!payload.email && !payload.password) {
      setAccError("Bitte neue E-Mail und/oder neues Passwort eingeben.");
      return;
    }

    try {
      setAccError(null);
      setAccSaving(true);
      await updateUserProfile(user.id, payload);
      setAccPassword("");
      alert("Deine Account-Daten wurden aktualisiert.");
    } catch (e: any) {
      setAccError(e?.message ?? "Aktualisierung fehlgeschlagen.");
    } finally {
      setAccSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      setAccError("Nicht eingeloggt.");
      return;
    }
    const ok = window.confirm(
      "Willst du deinen Account wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden."
    );
    if (!ok) return;

    try {
      setAccError(null);
      setAccDeleting(true);
      await deleteUserAccount(user.id);

      navigate("/");
    } catch (e: any) {
      setAccError(e?.message ?? "Löschen fehlgeschlagen.");
    } finally {
      setAccDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        py: 4,
        px: 2,
        bgcolor: "#f5f5f5",
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h5" fontWeight={600}>
          Schön, dass du da bist!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Hier ist deine Jobsuche im Überblick.
        </Typography>
      </Container>

      <Divider sx={{ my: 2 }} />

      {/* --------- Suchaufträge (Aktionen + Liste) --------- */}
      <Accordion
        expanded={expandedReq}
        onChange={(_, v) => setExpandedReq(v)}
        sx={{ maxWidth: 960, mx: "auto", bgcolor: "white" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EditLocationAltIcon color="primary" />
            <Typography fontWeight={600}>Suchaufträge</Typography>
            <Chip
              size="small"
              label={loading ? "lädt…" : `${requests.length}`}
            />
          </Stack>
        </AccordionSummary>

        <AccordionDetails>
          {/* Aktionen */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<EditLocationAltIcon />}
              onClick={() => navigate("/draw-search")}
            >
              Suchgebiet/Ort einzeichnen
            </Button>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={() => navigate("/address-search")}
            >
              Per Adresse suchen
            </Button>
          </Stack>

          {/* Liste */}
          {loading ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : requests.length === 0 ? (
            <Typography color="text.secondary">
              Du hast noch keine Suchaufträge erstellt.
            </Typography>
          ) : (
            <List disablePadding>
              {requests.map((r) => {
                const key = `${r.type}-${r.id}`;
                const isDeleting = !!deletingIds[key];

                return (
                  <ListItem
                    key={key}
                    divider
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        {r.type === "drawn" && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditLocationAltIcon />}
                            onClick={() => navigate(`/edit-drawn/${r.id}`)}
                          >
                            Bearbeiten
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => handleDelete(r)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Lösche…" : "Löschen"}
                        </Button>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                        >
                          <Typography>{r.name}</Typography>
                          <Chip
                            size="small"
                            label={
                              r.type === "address" ? "Adresse" : "Geometrie"
                            }
                          />
                          {r.jobType && (
                            <Chip
                              size="small"
                              label={r.jobType}
                              variant="outlined"
                              sx={{
                                ml: 0.5,
                                color: "text.secondary",
                                borderColor: "divider",
                                bgcolor: "grey.100",
                              }}
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        r.createdAt
                          ? new Date(r.createdAt).toLocaleString("de-DE")
                          : undefined
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      {/* --------- Gefundene Jobs (Accordion mit Count) --------- */}
      <Accordion
        expanded={expandedFound}
        onChange={(_, v) => setExpandedFound(v)}
        sx={{ maxWidth: 960, mx: "auto", bgcolor: "white" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WorkOutlineIcon color="primary" />
            <Typography fontWeight={600}>Gefundene Jobs</Typography>
            <Chip
              size="small"
              label={
                foundCountLoading
                  ? "lädt…"
                  : foundCountError
                  ? "—"
                  : `${foundCount ?? 0}`
              }
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<MapOutlinedIcon />}
              onClick={() => navigate("/found-jobs?mode=customVisible")}
              disabled={foundCountLoading}
            >
              Auf Karte anzeigen
            </Button>
          </Stack>

          {foundCountError ? (
            <Typography color="error">{foundCountError}</Typography>
          ) : (
            <Typography color="text.secondary">
              Anzahl der aktuell sichtbaren Jobs basierend auf deinen
              Suchaufträgen: <strong>{foundCount ?? 0}</strong>
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      {/* --------- Gespeicherte Jobs (Aktion + Liste) --------- */}
      <Accordion
        expanded={expandedSaved}
        onChange={(_, v) => setExpandedSaved(v)}
        sx={{ maxWidth: 960, mx: "auto", bgcolor: "white" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FavoriteBorderIcon color="primary" />
            <Typography fontWeight={600}>Gespeicherte Jobs</Typography>
            <Chip
              size="small"
              label={savedLoading ? "lädt…" : `${savedJobs.length}`}
            />
          </Stack>
        </AccordionSummary>

        <AccordionDetails>
          {/* Aktion */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<MapOutlinedIcon />}
              onClick={() => navigate("/saved-jobs")}
            >
              Auf Karte anzeigen
            </Button>
          </Stack>

          {/* Liste */}
          {savedLoading ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : savedError ? (
            <Typography color="error">{savedError}</Typography>
          ) : savedJobs.length === 0 ? (
            <Typography color="text.secondary">
              Du hast noch keine Jobs gespeichert.
            </Typography>
          ) : (
            <List disablePadding>
              {savedJobs.map((j) => {
                const key = `saved-${j.id}`;
                const isDeleting = !!deletingSaved[key];
                return (
                  <ListItem
                    key={key}
                    divider
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<InfoOutlinedIcon />}
                          onClick={() => setSavedSelected(j.raw)}
                        >
                          Details
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => handleDeleteSaved(j)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Lösche…" : "Löschen"}
                        </Button>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                        >
                          <Typography>{j.title}</Typography>
                          {j.company && (
                            <Chip
                              size="small"
                              label={j.company}
                              variant="outlined"
                              sx={{ ml: 0.5 }}
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        j.createdAt
                          ? new Date(j.createdAt).toLocaleString("de-DE")
                          : undefined
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      {/* --------- Alle Jobs (Accordion mit Count) --------- */}
      <Accordion
        expanded={expandedAll}
        onChange={(_, v) => setExpandedAll(v)}
        sx={{ maxWidth: 960, mx: "auto", bgcolor: "white" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AppsIcon color="primary" />
            <Typography fontWeight={600}>Alle Jobs</Typography>
            <Chip
              size="small"
              label={
                allCountLoading
                  ? "lädt…"
                  : allCountError
                  ? "—"
                  : `${allCount ?? 0}`
              }
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<MapOutlinedIcon />}
              onClick={() => navigate("/all-jobs")}
              disabled={allCountLoading}
            >
              Auf Karte anzeigen
            </Button>
          </Stack>

          {allCountError ? (
            <Typography color="error">{allCountError}</Typography>
          ) : (
            <Typography color="text.secondary">
              Gesamtanzahl aller verfügbaren Jobs:{" "}
              <strong>{allCount ?? 0}</strong>
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
      <Divider sx={{ my: 2 }} />
      {/* --------- Account verwalten --------- */}
      <Accordion
        expanded={expandedAccount}
        onChange={(_, v) => setExpandedAccount(v)}
        sx={{ maxWidth: 960, mx: "auto", bgcolor: "white" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ManageAccountsIcon color="primary" />
            <Typography fontWeight={600}>Account verwalten</Typography>
          </Stack>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={2} sx={{ maxWidth: 520 }}>
            {accError && (
              <Typography variant="body2" color="error">
                {accError}
              </Typography>
            )}

            <TextField
              label="E-Mail"
              type="email"
              value={accEmail}
              onChange={(e) => setAccEmail(e.target.value)}
              InputProps={{
                startAdornment: <EmailIcon fontSize="small" sx={{ mr: 1 }} />,
              }}
              fullWidth
            />

            <TextField
              label="Neues Passwort"
              type="password"
              value={accPassword}
              onChange={(e) => setAccPassword(e.target.value)}
              helperText="Leer lassen, wenn du das Passwort nicht ändern willst."
              InputProps={{
                startAdornment: <LockIcon fontSize="small" sx={{ mr: 1 }} />,
              }}
              fullWidth
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="contained"
                onClick={handleSaveAccount}
                disabled={accSaving}
              >
                {accSaving ? "Speichere…" : "Änderungen speichern"}
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteAccount}
                disabled={accDeleting}
                startIcon={<DeleteOutlineIcon />}
              >
                {accDeleting ? "Lösche…" : "Account löschen"}
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              Hinweis: Das Löschen deines Accounts entfernt dauerhaft alle
              zugehörigen Daten. Du wirst anschließend zur Startseite
              weitergeleitet.
            </Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      {/* Dialog für gespeicherten Job */}
      {savedSelected && (
        <FeatureDialog
          feature={savedSelected}
          onClose={() => setSavedSelected(null)}
        />
      )}
    </Box>
  );
};

export default DashboardPage;
