// src/pages/EditDrawnRequestPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
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

import AppHeader from "../components/UI/AppHeaderComponent";
import MapComponent from "../components/Map/MapComponent";
import { useAuth } from "../context/AuthContext";
import { fetchDrawnRequests } from "../services/fetchDrawnRequest";

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

  // 1) Gewählten Drawn-Request laden
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

  // 2) LayerGroup wie in MapPage, aber nur für EINEN Suchauftrag
  useEffect(() => {
    const map = olMapRef.current;
    if (!map) return;

    // alte Edit-Gruppe(n) entfernen
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

    // Geometrie-Feature erzeugen
    const geomLayer = new VectorLayer({
      source: new VectorSource({
        features: [
          new GeoJSON().readFeature(
            feature.type === "Feature"
              ? feature
              : {
                  type: "Feature",
                  geometry: feature.geometry,
                  properties: props,
                  id: feature.id,
                },
            {
              dataProjection: "EPSG:4326",
              featureProjection: "EPSG:3857",
            }
          ),
        ],
      }),
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
        // Polygon (oder MultiPolygon) – rot wie in MapPage
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

    // Fit auf die Geometrie
    const src = (geomLayer as any).getSource() as VectorSource;
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

    // Cleanup
    return () => {
      if (olMapRef.current) {
        olMapRef.current.removeLayer(group);
      }
    };
  }, [feature]);

  // 3) MapComponent: wie in MapPage – eigene Layer über olMapRef steuern
  const fetchFunction = () =>
    Promise.resolve({ type: "FeatureCollection", features: [] });

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <AppHeader />

      {/* Header-Bar */}
      <Box
        sx={{ position: "absolute", top: 72, left: 16, right: 16, zIndex: 10 }}
      >
        <Container maxWidth="md" disableGutters>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 2,
              py: 1,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 1,
            }}
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
              <Button size="small" variant="outlined" disabled>
                EDIT‑MODUS (BALD)
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </Container>
      </Box>

      {/* Karte; Layers steuern wir selbst via olMapRef */}
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
