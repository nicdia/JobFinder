// src/pages/MapShowSavedJobs.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";

import MapComponent, { MapHandle } from "../components/Map/MapComponent";
import FeatureDialog from "../components/Map/FeatureDetailsDialogComponent";
import JobsListWidget, { JobItem } from "../components/Map/JobsListWidget";
import LegendWidget from "../components/Map/LegendWidget";

import { fetchUserSavedJobs } from "../services/savedJobs";
import { useAuth } from "../context/AuthContext";

import { Map as OLMap } from "ol";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";

export default function MapShowSavedJobs() {
  const { user } = useAuth();

  const mapHandleRef = useRef<MapHandle>(null);
  const olMapRef = useRef<OLMap | null>(null);

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [featureCollection, setFeatureCollection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);

  const handleFeatureClick = useCallback((f: any) => {
    const p = f?.properties ?? f;
    if (p?.isJob === true) {
      setSelectedFeature(f);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user?.id) return; // wartet auf user
      setLoading(true);
      try {
        const savedFC = await fetchUserSavedJobs(user);

        const features = (savedFC?.features ?? []).map((f: any) => ({
          ...f,
          properties: { ...(f.properties ?? {}), isJob: true },
        }));

        if (!alive) return;

        setFeatureCollection({
          type: "FeatureCollection",
          features,
        });

        if (olMapRef.current) {
          // alte Layer entfernen
          olMapRef.current
            .getLayers()
            .getArray()
            .filter((l: any) => l.get("layerType") === "savedJobs")
            .forEach((l) => olMapRef.current!.removeLayer(l));

          // neue Features in OL-Layer
          const olFeatures = new GeoJSON().readFeatures(
            { type: "FeatureCollection", features },
            {
              dataProjection: "EPSG:4326",
              featureProjection: "EPSG:3857",
            }
          );

          const savedJobStyle = new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: "#e91e63" }),
              stroke: new Stroke({ color: "#c2185b", width: 2 }),
            }),
          });

          const jobLayer = new VectorLayer({
            source: new VectorSource({ features: olFeatures }),
            style: savedJobStyle,
          });
          jobLayer.set("layerType", "savedJobs");
          jobLayer.set("title", "Gespeicherte Jobs");

          olMapRef.current.addLayer(jobLayer);
        }

        const list: JobItem[] = features
          .filter((f: any) => f?.geometry?.type === "Point")
          .map((f: any) => ({
            id: f.id,
            title: f.properties?.title ?? "Job",
            company: f.properties?.company,
            coord: f.geometry.coordinates, // [lon,lat]
          }));

        setJobs(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

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

  if (!user?.id) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
        key={"saved-" + user.id}
        fetchFunction={fetchFunction}
        onFeatureClick={handleFeatureClick}
        enableLayerSwitcher={true}
      />

      {featureCollection?.features?.length ? (
        <LegendWidget onlySavedJobs />
      ) : null}

      <JobsListWidget
        jobs={jobs}
        onSelect={handleJobSelect}
        onOpenPopup={handleOpenPopup}
        userId={user.id}
        initialSavedIds={jobs.map((j) => j.id)} // Herzen direkt gefüllt
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
