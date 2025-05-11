import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import AppHeader from "../components/UI/AppHeaderComponent";
import MapComponent, { MapHandle } from "../components/Map/MapComponent";
import FeatureDialog from "../components/Map/FeatureDetailsDialogComponent";
import JobsListWidget, { JobItem } from "../components/Map/JobsListWidget";

import { fetchAllJobs } from "../services/allJobsApi";
import { fetchUserVisibleJobs } from "../services/fetchUserVisibleJobs";
import { useAuth } from "../context/AuthContext";

/* --------------------------------------------------------------- */

export default function MapPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode"); // "customVisible" | null

  /* map ref für zoomTo ------------------------------------------ */
  const mapRef = useRef<MapHandle>(null);

  /* jobs & loading ---------------------------------------------- */
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [featureCollection, setFeatureCollection] = useState<any | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);

  /* selected feature dialog ------------------------------------- */
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const handleFeatureClick = useCallback((f: any) => setSelectedFeature(f), []);

  /* Lade Jobs ---------------------------------------------------- */
  useEffect(() => {
    async function load() {
      if (mode === "customVisible" && !user?.id) return;
      setLoadingJobs(true);
      try {
        const apiFn =
          mode === "customVisible"
            ? () => fetchUserVisibleJobs(user!)
            : fetchAllJobs;
        const data: any = await apiFn(); // <- FeatureCollection
        setFeatureCollection(data); // for Map
        setJobs(
          data.features.map((f: any) => ({
            id: f.id,
            title: f.properties?.title ?? "Job",
            company: f.properties?.company,
            coord: f.geometry.coordinates,
          }))
        );
      } finally {
        setLoadingJobs(false);
      }
    }
    load();
  }, [mode, user]);

  /* Guard bis user geladen -------------------------------------- */
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

  /* fetch‑Fn für Map -------------------------------------------- */
  /* fetchFunction, das die Map versteht --------------------- */
  const fetchFunction = () =>
    Promise.resolve(
      featureCollection ?? { type: "FeatureCollection", features: [] }
    );

  /* job klick → map zoom ---------------------------------------- */
  const handleJobSelect = (j: JobItem) => mapRef.current?.zoomTo(j.coord, 17);

  /* render ------------------------------------------------------- */
  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <AppHeader />

      <MapComponent
        ref={mapRef}
        key={mode + (user?.id ?? "anon")}
        fetchFunction={fetchFunction}
        onFeatureClick={handleFeatureClick}
      />

      <JobsListWidget jobs={jobs} onSelect={handleJobSelect} />

      <FeatureDialog
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
      />

      {loadingJobs && (
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
