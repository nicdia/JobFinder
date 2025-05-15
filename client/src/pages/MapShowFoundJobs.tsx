// src/pages/MapPage.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import AppHeader from "../components/UI/AppHeaderComponent";
import MapComponent, { MapHandle } from "../components/Map/MapComponent";
import FeatureDialog from "../components/Map/FeatureDetailsDialogComponent";
import JobsListWidget, { JobItem } from "../components/Map/JobsListWidget";

import { fetchAllJobs } from "../services/allJobsApi";
import { fetchUserVisibleJobs } from "../services/fetchUserVisibleJobs";
import { fetchUserSearchAreas } from "../services/fetchUserSearchAreas"; // ⬅️  NEW
import { useAuth } from "../context/AuthContext";

import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Stroke, Fill, Style } from "ol/style";
import { Map as OLMap } from "ol";

export default function MapPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode"); // "customVisible" | null

  /* Refs -------------------------------------------------------- */
  const mapHandleRef = useRef<MapHandle>(null); // zoomTo()
  const olMapRef = useRef<OLMap | null>(null); // echte OL-Map

  /* State ------------------------------------------------------- */
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [featureCollection, setFeatureCollection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const handleFeatureClick = useCallback((f: any) => setSelectedFeature(f), []);

  /* Daten laden ------------------------------------------------- */
  useEffect(() => {
    async function load() {
      if (mode === "customVisible" && !user?.id) return;

      setLoading(true);
      try {
        /* 1) Jobs ------------------------------------------------ */
        const jobsFC =
          mode === "customVisible"
            ? await fetchUserVisibleJobs(user!)
            : await fetchAllJobs();

        setJobs(
          jobsFC.features.map((f: any) => ({
            id: f.id,
            title: f.properties?.title ?? "Job",
            company: f.properties?.company,
            coord: f.geometry.coordinates,
          }))
        );

        /* 2) Suchgebiete (nur wenn User) ------------------------ */
        let areasFC = { type: "FeatureCollection", features: [] };
        if (user?.id) {
          try {
            areasFC = await fetchUserSearchAreas(user);
          } catch (err) {
            console.warn("⚠️  Konnte Suchgebiete nicht laden:", err);
          }
        }

        /* 3) Für Map-Component alles zusammenführen ------------- */
        setFeatureCollection({
          type: "FeatureCollection",
          features: [...jobsFC.features, ...areasFC.features],
        });

        /* 4) Suchgebiete als eigenen Layer in die OL-Map hängen --*/
        if (olMapRef.current) {
          // Bestehenden Layer ggf. entfernen
          const existing = olMapRef.current
            .getLayers()
            .getArray()
            .find((l) => (l as any).get("title") === "Search Areas");
          if (existing) olMapRef.current.removeLayer(existing);

          if (areasFC.features.length) {
            const source = new VectorSource({
              features: new GeoJSON().readFeatures(areasFC, {
                dataProjection: "EPSG:4326",
                featureProjection: "EPSG:3857",
              }),
            });

            const searchLayer = new VectorLayer({
              source,
              title: "Search Areas", // 🠒 erscheint im Layer-Switcher
              type: "overlay",
              style: new Style({
                stroke: new Stroke({ color: "#ff1744", width: 2 }),
                fill: new Fill({ color: "rgba(255,23,68,0.15)" }),
              }),
            });

            olMapRef.current.addLayer(searchLayer);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mode, user]);

  /* Guard bis User geladen ------------------------------------- */
  if (mode === "customVisible" && !user?.id) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* fetch-Fn für MapComponent ---------------------------------- */
  const fetchFunction = () =>
    Promise.resolve(
      featureCollection ?? { type: "FeatureCollection", features: [] }
    );

  /* Job-Klick → Zoom ------------------------------------------ */
  const handleJobSelect = (j: JobItem) =>
    mapHandleRef.current?.zoomTo(j.coord, 17);

  /* Render ----------------------------------------------------- */
  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <AppHeader />

      <MapComponent
        ref={mapHandleRef}
        mapRef={olMapRef} // echte OL-Map
        key={mode + (user?.id ?? "anon")}
        fetchFunction={fetchFunction}
        onFeatureClick={handleFeatureClick}
        enableLayerSwitcher={true}
      />

      <JobsListWidget jobs={jobs} onSelect={handleJobSelect} />

      <FeatureDialog
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
      />

      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(255,255,255,0.55)",
            display: "grid",
            placeItems: "center",
            zIndex: 1200,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
