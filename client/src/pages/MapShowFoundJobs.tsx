// src/pages/MapPage.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import AppHeader from "../components/UI/AppHeaderComponent";
import MapComponent, { MapHandle } from "../components/Map/MapComponent";
import FeatureDialog from "../components/Map/FeatureDetailsDialogComponent";
import JobsListWidget, { JobItem } from "../components/Map/JobsListWidget";

import { fetchAllJobs } from "../services/fetchAllJobsApi";
import { fetchUserVisibleJobs } from "../services/fetchUserVisibleJobs";
import { fetchUserSearchAreas } from "../services/fetchUserSearchAreas";
import { fetchUserSearchRequests } from "../services/fetchSearchRequest";
import { useAuth } from "../context/AuthContext";

import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import LayerGroup from "ol/layer/Group";
import GeoJSON from "ol/format/GeoJSON";
import { Stroke, Fill, Style, Circle as CircleStyle } from "ol/style";
import { Map as OLMap } from "ol";

export default function MapPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode"); // "customVisible" | null

  /* Refs ------------------------------------------------------ */
  const mapHandleRef = useRef<MapHandle>(null);
  const olMapRef = useRef<OLMap | null>(null);

  /* State ----------------------------------------------------- */
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [featureCollection, setFeatureCollection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const handleFeatureClick = useCallback((f: any) => setSelectedFeature(f), []);

  /* Daten laden ---------------------------------------------- */
  useEffect(() => {
    async function load() {
      if (mode === "customVisible" && !user?.id) return;

      setLoading(true);
      try {
        /* 1) Jobs --------------------------------------------- */
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

        /* 2) Areas + Requests --------------------------------- */
        let areasFC = { type: "FeatureCollection", features: [] };
        let searchReqFC = { type: "FeatureCollection", features: [] };

        if (user?.id) {
          try {
            areasFC = await fetchUserSearchAreas(user);
            searchReqFC = await fetchUserSearchRequests(user);
            console.log("[MapPage] Search Requests:", searchReqFC);
          } catch (err) {
            console.warn("⚠️  Laden der Gebiete/Requests fehlgeschlagen:", err);
          }
        }

        /* 3) MapComponent-Daten ------------------------------- */
        setFeatureCollection({
          type: "FeatureCollection",
          features: [
            ...jobsFC.features,
            ...areasFC.features,
            ...searchReqFC.features,
          ],
        });

        /* 4) Gruppen-Layer pro Area --------------------------- */
        if (olMapRef.current) {
          // Alte Groups entfernen
          olMapRef.current
            .getLayers()
            .getArray()
            .filter((l) => (l as any).get("layerType") === "searchAreaGroup")
            .forEach((l) => olMapRef.current!.removeLayer(l));

          /* Index: Jobs nach Area-ID */
          const jobsByArea: Record<string, any[]> = {};
          jobsFC.features.forEach((feat: any) => {
            const key = feat.properties?.search_area_id ?? "null";
            (jobsByArea[key] ||= []).push(feat);
          });

          /* Index: Request-Point nach Area-ID */
          const reqPointByArea: Record<string, any> = {};
          searchReqFC.features.forEach((feat: any) => {
            const key =
              feat.properties?.search_area_id ??
              feat.properties?.linked_area_id ??
              feat.properties?.searchAreaId;
            if (key) reqPointByArea[key] = feat;
          });

          /* Groups bauen */
          areasFC.features.forEach((areaFeat: any, idx: number) => {
            const areaId = areaFeat.properties?.search_area_id ?? areaFeat.id;
            const areaLabel =
              areaFeat.properties?.label ?? `Suchgebiet ${idx + 1}`;

            /* Polygon-Layer */
            const polyLayer = new VectorLayer({
              source: new VectorSource({
                features: [
                  new GeoJSON().readFeature(areaFeat, {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3857",
                  }),
                ],
              }),
              title: "Fläche",
              type: "overlay",
              style: new Style({
                stroke: new Stroke({ color: "#ff1744", width: 2 }),
                fill: new Fill({ color: "rgba(255,23,68,0.15)" }),
              }),
            });

            /* Jobs-Layer */
            const jobLayer = new VectorLayer({
              source: new VectorSource({
                features: new GeoJSON().readFeatures(
                  {
                    type: "FeatureCollection",
                    features: jobsByArea[areaId] || [],
                  },
                  {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3857",
                  }
                ),
              }),
              title: "Jobs",
              type: "overlay",
            });

            /* Request-Point-Layer (falls vorhanden) */
            let reqPointLayer: VectorLayer | null = null;
            const reqPointFeat = reqPointByArea[areaId];
            if (reqPointFeat) {
              reqPointLayer = new VectorLayer({
                source: new VectorSource({
                  features: [
                    new GeoJSON().readFeature(reqPointFeat, {
                      dataProjection: "EPSG:4326",
                      featureProjection: "EPSG:3857",
                    }),
                  ],
                }),
                title: "Startpunkt",
                type: "overlay",
                style: new Style({
                  image: new CircleStyle({
                    radius: 6,
                    fill: new Fill({ color: "#1976d2" }),
                    stroke: new Stroke({ color: "#fff", width: 1.5 }),
                  }),
                }),
              });
            }

            /* Layers zusammenführen */
            const layersArr = reqPointLayer
              ? [polyLayer, jobLayer, reqPointLayer]
              : [polyLayer, jobLayer];

            const group = new LayerGroup({
              title: areaLabel,
              layers: layersArr,
            });
            group.set("layerType", "searchAreaGroup");
            group.set("searchAreaId", areaId);

            olMapRef.current.addLayer(group);
          });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mode, user]);

  /* Guard ----------------------------------------------------- */
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

  /* fetchFn für MapComponent --------------------------------- */
  const fetchFunction = () =>
    Promise.resolve(
      featureCollection ?? { type: "FeatureCollection", features: [] }
    );

  /* Job-Klick → Zoom ---------------------------------------- */
  const handleJobSelect = (j: JobItem) =>
    mapHandleRef.current?.zoomTo(j.coord, 17);

  /* Render --------------------------------------------------- */
  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <AppHeader />

      <MapComponent
        ref={mapHandleRef}
        mapRef={olMapRef}
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
