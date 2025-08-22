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

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardSection from "../components/UI/DashboardSectionComponent";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FeatureDialog from "../components/Map/FeatureDetailsDialogComponent"; // Pfad wie bei dir

// Services – bestehend
import { fetchUserSearchRequests } from "../services/fetchAddressRequest";
import { fetchDrawnRequests } from "../services/fetchDrawnRequest";
import { deleteAddressRequest } from "../services/deleteAdressRequest";
import { deleteDrawnRequest } from "../services/deleteDrawnRequest";

// Services – NEU für Saved Jobs
import { fetchUserSavedJobs, deleteUserSavedJob } from "../services/savedJobs";

// -------- Hilfen zum Normalisieren ----------
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
  id: number | string; // entspricht job_id
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

  // Accordion: Requests (bestehend)
  const [expanded, setExpanded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [addrData, setAddrData] = useState<AnyFeature[]>([]);
  const [drawnData, setDrawnData] = useState<AnyFeature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  // Accordion: Saved Jobs (NEU)
  const [savedExpanded, setSavedExpanded] = useState<boolean>(false);
  const [savedLoading, setSavedLoading] = useState<boolean>(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [savedFeatures, setSavedFeatures] = useState<AnyFeature[]>([]);
  // Popup für gespeicherte Jobs
  const [savedSelected, setSavedSelected] = useState<any | null>(null);

  const [deletingSaved, setDeletingSaved] = useState<Record<string, boolean>>(
    {}
  );

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
      // Feature-ID ist job_id, Properties kommen aus Snapshot
      const id = (f.id ?? f.properties?.job_id) as number | string;
      const p = f.properties ?? {};
      return {
        id,
        title: p.title ?? `Job #${id}`,
        company: p.company ?? undefined,
        createdAt: p.created_at ?? p.saved_at ?? undefined, // falls vorhanden
        externalUrl: p.external_url ?? undefined,
        raw: f,
      };
    });
  }, [savedFeatures]);

  // Delete-Handler (Requests – bestehend)
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

  // Delete-Handler (Saved Jobs – NEU)
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

      <DashboardSection
        icon={<WorkOutlineIcon sx={{ fontSize: 40, color: "primary.main" }} />}
        title="Gefundene Jobs"
        description="Hier findest du die gefundenen Jobs, basierend auf deinen Suchanfragen."
        buttonLabel="Anzeigen"
        onClick={() => navigate("/found-jobs?mode=customVisible")}
      />

      <Divider sx={{ my: 2 }} />

      {/* Optional: Kachel; echte Liste unten im Accordion */}
      <DashboardSection
        icon={
          <FavoriteBorderIcon sx={{ fontSize: 40, color: "primary.main" }} />
        }
        title="Gespeicherte Jobs"
        description="Hier siehst du eine Übersicht der Jobs, die du mit einem Herz markiert hast."
        buttonLabel="Anzeigen"
        onClick={() => navigate("/saved-jobs")} // 👈 statt setSavedExpanded(true)
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

      <Divider sx={{ my: 3 }} />

      {/* --------- Suchaufträge (bearbeiten & löschen) --------- */}
      <Accordion
        expanded={expanded}
        onChange={(_, v) => setExpanded(v)}
        sx={{ maxWidth: 960, mx: "auto", bgcolor: "white" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EditLocationAltIcon color="primary" />
            <Typography fontWeight={600}>
              Suchaufträge (bearbeiten & löschen)
            </Typography>
            <Chip
              size="small"
              label={loading ? "lädt…" : `${requests.length}`}
            />
          </Stack>
        </AccordionSummary>

        <AccordionDetails>
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

      <Divider sx={{ my: 3 }} />

      {/* --------- Gespeicherte Jobs (Details & löschen) --------- */}
      <Accordion
        expanded={savedExpanded}
        onChange={(_, v) => setSavedExpanded(v)}
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
                          onClick={() => setSavedSelected(j.raw)} // Popup öffnen
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

      <Divider sx={{ my: 3 }} />

      <DashboardSection
        icon={<AppsIcon sx={{ fontSize: 40, color: "primary.main" }} />}
        title="Alle Jobs"
        description="Du willst einfach mal alle Jobs ungefiltert ansehen? Klicke hier."
        buttonLabel="Anzeigen"
        onClick={() => navigate("/map?mode=all")}
      />

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
