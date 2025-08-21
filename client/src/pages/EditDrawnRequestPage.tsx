// src/pages/EditDrawnRequestPage.tsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Fade,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";

import { Map as OLMap } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import LayerGroup from "ol/layer/Group";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import { unByKey } from "ol/Observable";
import Modify from "ol/interaction/Modify";
import DoubleClickZoom from "ol/interaction/DoubleClickZoom";

import AppHeader from "../components/UI/AppHeaderComponent";
import MapComponent from "../components/Map/MapComponent";
import { useAuth } from "../context/AuthContext";
import { fetchDrawnRequests } from "../services/fetchDrawnRequest";
import { updateDrawnRequest } from "../services/updateDrawnRequest";

type AnyFeature = {
  id?: number | string;
  type: "Feature";
  geometry?: any;
  properties?: Record<string, any>;
};

export default function EditDrawnRequestPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const olMapRef = useRef<OLMap | null>(null);
  const layerListenerKeys = useRef<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feature, setFeature] = useState<AnyFeature | null>(null);
  const [editing, setEditing] = useState(false);

  const modifyInteractionRef = useRef<Modify | null>(null);
  const contextMenuListenerRef = useRef<(evt: MouseEvent) => void>();
  const doubleClickListenerRef = useRef<(evt: any) => void>();

  // --- 1) Drawn-Request laden ---
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDrawnRequests(user || undefined);
        const feats: AnyFeature[] =
          data?.type === "FeatureCollection"
            ? data.features
            : Array.isArray(data)
            ? data
            : [];
        const match =
          feats.find(
            (f) => String(f.id ?? f.properties?.id) === String(requestId)
          ) || null;

        if (!alive) return;
        if (!match) {
          setError("Suchauftrag wurde nicht gefunden.");
          setFeature(null);
        } else {
          setFeature(match);
        }
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Fehler beim Laden des Suchauftrags.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, requestId]);

  // --- 2) LayerGroup mit EINEM Feature aufbauen und fitten ---
  useEffect(() => {
    const map = olMapRef.current;
    if (!map) return;

    // Alte Edit-Gruppen weg
    map
      .getLayers()
      .getArray()
      .filter((l: any) => l?.get?.("layerType") === "editDrawnGroup")
      .forEach((l) => map.removeLayer(l));
    layerListenerKeys.current.forEach(unByKey);
    layerListenerKeys.current = [];

    if (!feature || !feature.geometry) return;

    const props = feature.properties ?? {};
    const label = props.req_name ?? `Geometrie #${feature.id}`;

    // Feature erzeugen (und ID setzen, wichtig fürs Speichern)
    const olFeature = new GeoJSON().readFeature(
      feature.type === "Feature"
        ? feature
        : {
            type: "Feature",
            geometry: feature.geometry,
            properties: props,
            id: feature.id,
          },
      { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" }
    );
    if (feature.id != null && olFeature.getId() == null) {
      olFeature.setId(feature.id);
    }

    const geomLayer = new VectorLayer({
      source: new VectorSource({ features: [olFeature] }),
      title: "Geometrie",
      type: "overlay",
      style: (() => {
        const gtype = feature.geometry?.type;
        if (gtype === "Point") {
          return new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: "#1976d2" }),
              stroke: new Stroke({ color: "#fff", width: 2 }),
            }),
          });
        }
        if (gtype === "LineString") {
          return new Style({
            stroke: new Stroke({ color: "#1976d2", width: 3 }),
          });
        }
        return new Style({
          stroke: new Stroke({ color: "#ff1744", width: 2 }),
          fill: new Fill({ color: "rgba(255,23,68,0.15)" }),
        });
      })(),
    });

    const group = new LayerGroup({
      title: label,
      layers: [geomLayer],
    });
    group.set("layerType", "editDrawnGroup");
    group.set("searchAreaId", feature.id ?? props.id ?? -1);

    map.addLayer(group);

    // Fit auf Geometrie
    const src = geomLayer.getSource() as VectorSource;
    const extent = src.getExtent();
    const view = map.getView();
    setTimeout(() => {
      const hasExtent =
        extent &&
        isFinite(extent[0]) &&
        isFinite(extent[1]) &&
        isFinite(extent[2]) &&
        isFinite(extent[3]);
      if (hasExtent) {
        view.fit(extent, {
          padding: [60, 60, 60, 360],
          duration: 400,
          maxZoom: 17,
        });
      }
    }, 0);

    return () => {
      if (olMapRef.current) olMapRef.current.removeLayer(group);
    };
  }, [feature]);

  // --- 3) Edit-Modus an/aus (Modify + Events) ---
  useEffect(() => {
    const map = olMapRef.current;
    if (!map) return;

    if (editing) {
      // Source der Edit-Gruppe finden
      let source: VectorSource | null = null;
      const editGroup = map
        .getLayers()
        .getArray()
        .find((l: any) => l.get && l.get("layerType") === "editDrawnGroup");
      if (editGroup) {
        const layers = (editGroup as LayerGroup).getLayers().getArray();
        if (layers.length > 0) {
          source = (layers[0] as VectorLayer).getSource() as VectorSource;
        }
      }
      if (!source) return;

      // Modify aktivieren
      const modify = new Modify({ source });
      map.addInteraction(modify);
      modifyInteractionRef.current = modify;

      // DoubleClickZoom aus, damit wir Doppelklick zum Beenden nutzen können
      map.getInteractions().forEach((i) => {
        if (i instanceof DoubleClickZoom) i.setActive(false);
      });

      // Rechtsklick => speichern
      const handleContextMenu = (evt: MouseEvent) => {
        evt.preventDefault();
        handleSave();
      };
      map.getViewport().addEventListener("contextmenu", handleContextMenu);
      contextMenuListenerRef.current = handleContextMenu;

      // Doppelklick => speichern
      const handleDoubleClick = () => handleSave();
      map.on("dblclick", handleDoubleClick as any);
      doubleClickListenerRef.current = handleDoubleClick;
    } else {
      // Modify & Listener entfernen, DoubleClickZoom wieder an
      if (modifyInteractionRef.current) {
        map.removeInteraction(modifyInteractionRef.current);
        modifyInteractionRef.current = null;
      }
      map.getInteractions().forEach((i) => {
        if (i instanceof DoubleClickZoom) i.setActive(true);
      });
      if (contextMenuListenerRef.current) {
        map
          .getViewport()
          .removeEventListener("contextmenu", contextMenuListenerRef.current);
        contextMenuListenerRef.current = undefined;
      }
      if (doubleClickListenerRef.current) {
        map.un("dblclick", doubleClickListenerRef.current as any);
        doubleClickListenerRef.current = undefined;
      }
    }

    return () => {
      if (modifyInteractionRef.current) {
        map.removeInteraction(modifyInteractionRef.current);
        modifyInteractionRef.current = null;
      }
      if (contextMenuListenerRef.current) {
        map
          .getViewport()
          .removeEventListener("contextmenu", contextMenuListenerRef.current);
        contextMenuListenerRef.current = undefined;
      }
      if (doubleClickListenerRef.current) {
        map.un("dblclick", doubleClickListenerRef.current as any);
        doubleClickListenerRef.current = undefined;
      }
      map.getInteractions().forEach((i) => {
        if (i instanceof DoubleClickZoom) i.setActive(true);
      });
    };
  }, [editing]);

  // --- 4) Speichern ---
  const handleSave = async () => {
    const map = olMapRef.current;
    if (!map) return;

    let updatedFeature;
    const editGroup = map
      .getLayers()
      .getArray()
      .find((l: any) => l.get && l.get("layerType") === "editDrawnGroup");
    if (editGroup) {
      const src = (
        (editGroup as LayerGroup).getLayers().item(0) as VectorLayer
      ).getSource() as VectorSource;
      updatedFeature = src.getFeatures()[0];
    }
    if (!updatedFeature) {
      setEditing(false);
      return;
    }

    const geojson = new GeoJSON().writeFeatureObject(updatedFeature, {
      featureProjection: "EPSG:3857",
      dataProjection: "EPSG:4326",
    });
    if (updatedFeature.getId()) {
      geojson.id = updatedFeature.getId();
    }

    try {
      await updateDrawnRequest(user, requestId!, geojson);
      setEditing(false);
      navigate(-1);
    } catch (e: any) {
      console.error("Error saving edited geometry:", e);
      setError(e?.message ?? "Fehler beim Speichern der Änderungen.");
    }
  };

  // Dummy fetch for MapComponent
  const fetchFunction = () =>
    Promise.resolve({ type: "FeatureCollection", features: [] });

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <AppHeader />

      {/* Obere Bar: zentriert und fixiert */}
      <Box
        sx={{
          position: "fixed",
          top: 72,
          left: 0,
          right: 0,
          zIndex: 3000,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none", // Wrapper nicht klickbar
        }}
      >
        <Paper
          elevation={1}
          sx={{
            pointerEvents: "auto", // Panel selbst klickbar
            borderRadius: 2,
            px: 2,
            py: 1,
            width: "min(920px, calc(100% - 32px))", // max-breite + Seitenrand
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={() => navigate(-1)} size="small">
                <ArrowBackIcon />
              </IconButton>
              <EditLocationAltIcon color="primary" />
              <Typography fontWeight={700}>Geometrie bearbeiten</Typography>
              {feature?.properties?.req_name && (
                <Chip size="small" label={feature.properties.req_name} />
              )}
              {feature?.properties?.job_type && (
                <Chip
                  size="small"
                  label={feature.properties.job_type}
                  variant="outlined"
                  sx={{
                    color: "text.secondary",
                    borderColor: "divider",
                    bgcolor: "grey.100",
                  }}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              {!editing ? (
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => setEditing(true)}
                >
                  Bearbeiten starten
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                >
                  Änderungen speichern
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Info-Hinweis nur im Edit‑Modus */}
          <Fade in={editing} unmountOnExit>
            <Alert
              severity="info"
              sx={{
                mt: 1,
                borderRadius: 1.5,
              }}
            >
              Ziehe an der Geometrie, um die Form zu verändern. Drücke danach
              erneut auf den Knopf, um die Änderungen zu speichern.{" "}
            </Alert>
          </Fade>

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Box>

      {/* Karte */}
      <MapComponent
        mapRef={olMapRef}
        fetchFunction={fetchFunction}
        onFeatureClick={() => {}}
        disableFeatureInfo={true}
        enableLayerSwitcher={true}
      />

      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255,255,255,0.55)",
            zIndex: 9,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
