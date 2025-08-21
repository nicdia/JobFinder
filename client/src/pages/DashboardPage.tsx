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
import AppHeader from "../components/UI/AppHeaderComponent";
import DashboardSection from "../components/UI/DashboardSectionComponent";

import { fetchUserSearchRequests } from "../services/fetchAddressRequest";
import { fetchDrawnRequests } from "../services/fetchDrawnRequest";
import { deleteAddressRequest } from "../services/deleteAdressRequest";
import { deleteDrawnRequest } from "../services/deleteDrawnRequest";
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
  jobType?: string; // ⬅️ neu
  raw: AnyFeature;
};

function extractFeatures(input: any): AnyFeature[] {
  // Akzeptiere sowohl FeatureCollection als auch Array<Feature>
  if (!input) return [];
  if (Array.isArray(input)) return input as AnyFeature[];
  if (input.type === "FeatureCollection" && Array.isArray(input.features)) {
    return input.features as AnyFeature[];
  }
  // Fallback: einzelnes Feature?
  if (input.type === "Feature") return [input as AnyFeature];
  return [];
}

function pickName(props: Record<string, any> = {}, id: number | string) {
  return (
    props.req_name ??
    props.label ??
    props.title ??
    props.address_display ??
    `Suchauftrag #${id}` // ⬅️ fix: Template String
  );
}
// --------------------------------------------

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [addrData, setAddrData] = useState<AnyFeature[]>([]);
  const [drawnData, setDrawnData] = useState<AnyFeature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({}); // ⬅️ Busy-State pro Eintrag

  // Beim Mount laden
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

  // Vereinheitlichte Liste
  const requests: UnifiedRequest[] = useMemo(() => {
    const a = addrData.map((f) => {
      const id = (f.id ?? f.properties?.id) as number | string;
      const props = f.properties ?? {};
      return {
        id,
        type: "address" as const,
        name: pickName(props, id),
        createdAt: props.created_at,
        jobType: props.job_type ?? undefined, // ⬅️ neu
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
        jobType: props.job_type ?? undefined, // ⬅️ neu
        raw: f,
      };
    });

    return [...a, ...d];
  }, [addrData, drawnData]);

  // Delete-Handler (vorerst nur für Address-Requests aktiv)
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
        await deleteDrawnRequest(Number(r.id), user || undefined); // ⬅️ neu
        setDrawnData(
          (prev) =>
            prev.filter(
              (f) => String(f.id ?? f.properties?.id) !== String(r.id)
            ) // ⬅️ neu
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

  return (
    <>
      <AppHeader />
      <Box
        sx={{
          py: 4,
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          px: 2,
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
          onClick={() => navigate("/found-jobs?mode=customVisible")}
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

        {/* --------- kombinierte, aufklappbare Sektion --------- */}
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
                label={loading ? "lädt…" : `${requests.length}`} // ⬅️ fix
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
                      key={key} // ⬅️ fix
                      divider
                      secondaryAction={
                        <Stack direction="row" spacing={1}>
                          {/* Bearbeiten: Platzhalter */}
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditLocationAltIcon />}
                            onClick={() => {}}
                            disabled={isDeleting}
                          >
                            Bearbeiten
                          </Button>
                          {/* Löschen: aktiv für Address-Requests */}
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
                                  bgcolor: "grey.100", // dezent eingegraut
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

        <DashboardSection
          icon={<AppsIcon sx={{ fontSize: 40, color: "primary.main" }} />}
          title="Alle Jobs"
          description="Du willst einfach mal alle Jobs ungefiltert ansehen? Klicke hier."
          buttonLabel="Anzeigen"
          onClick={() => navigate("/map?mode=all")}
        />

        <Divider sx={{ my: 2 }} />
      </Box>
    </>
  );
};

export default DashboardPage;
