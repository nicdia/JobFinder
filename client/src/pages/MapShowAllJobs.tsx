// src/pages/MapShowAllJobs.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";

import MapComponent, { MapHandle } from "../components/Map/MapComponent";
import FeatureDialog from "../components/Map/FeatureDetailsDialogComponent";
import JobsListWidget, { JobItem } from "../components/Map/JobsListWidget";
import LegendWidget from "../components/Map/LegendWidget";

import { fetchAllJobs } from "../services/fetchAllJobsApi";
import { useAuth } from "../context/AuthContext";

import { Map as OLMap } from "ol";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";

export default function MapShowAllJobs() {
  const { user } = useAuth();

  /* Refs */
  const mapHandleRef = useRef<MapHandle>(null);
  const olMapRef = useRef<OLMap | null>(null);

  /* State */
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [featureCollection, setFeatureCollection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);

  const handleFeatureClick = useCallback((f: any) => {
    const p = f?.properties ?? f;
    if (p?.isJob === true) setSelectedFeature(f);
  }, []);

  /* Daten laden */
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const allFC = await fetchAllJobs();

        const features = (allFC?.features ?? []).map((f: any) => ({
          ...f,
          properties: { ...(f.properties ?? {}), isJob: true },
        }));

        if (!alive) return;

        setFeatureCollection({ type: "FeatureCollection", features });

        if (olMapRef.current) {
          olMapRef.current
            .getLayers()
            .getArray()
            .filter((l: any) => l.get("layerType") === "allJobs")
            .forEach((l) => olMapRef.current!.removeLayer(l));

          const olFeatures = new GeoJSON().readFeatures(
            { type: "FeatureCollection", features },
            { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" }
          );

          const allJobsStyle = new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: "#424242" }),
              stroke: new Stroke({ color: "#212121", width: 1 }),
            }),
          });

          const jobLayer = new VectorLayer({
            source: new VectorSource({ features: olFeatures }),
            style: allJobsStyle,
          });
          jobLayer.set("layerType", "allJobs");
          jobLayer.set("title", "Alle Jobs");

          olMapRef.current.addLayer(jobLayer);
        }

        const list: JobItem[] = features
          .filter((f: any) => f?.geometry?.type === "Point")
          .map((f: any) => ({
            id: f.id,
            title: f.properties?.title ?? "Job",
            company: f.properties?.company,
            coord: f.geometry.coordinates,
          }));

        setJobs(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const fetchFunction = () =>
    Promise.resolve(
      featureCollection ?? { type: "FeatureCollection", features: [] }
    );

  const handleJobSelect = useCallback((j: JobItem) => {
    mapHandleRef.current?.zoomTo(j.coord, 17);
  }, []);

  const handleOpenPopup = useCallback(
    (j: JobItem) => {
      const feat = featureCollection?.features?.find(
        (f: any) => String(f.id) === String(j.id)
      );
      if (feat) setSelectedFeature(feat);
    },
    [featureCollection]
  );

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <MapComponent
        ref={mapHandleRef}
        mapRef={olMapRef}
        key={"all-jobs"}
        fetchFunction={fetchFunction}
        onFeatureClick={handleFeatureClick}
        enableLayerSwitcher={true}
      />

      {featureCollection?.features?.length ? (
        <LegendWidget onlyAllJobs />
      ) : null}

      <JobsListWidget
        jobs={jobs}
        onSelect={handleJobSelect}
        onOpenPopup={handleOpenPopup}
        userId={user?.id}
        initialSavedIds={[]} // irrelevant, weil Herzen ausgeblendet
        hideSaveActions={true} // 👈 Herzen ausblenden NUR hier
      />

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
