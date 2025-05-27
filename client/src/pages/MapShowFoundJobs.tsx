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
import { fetchUserIsochrones } from "../services/fetchIsochrones";
import { fetchDrawnRequests } from "../services/fetchDrawnRequest";
import { fetchUserSearchRequests } from "../services/fetchAddressRequest";
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

        let isoFC = { type: "FeatureCollection", features: [] };
        let drawnReqFC = { type: "FeatureCollection", features: [] };
        let addressReqFC = { type: "FeatureCollection", features: [] };
        if (user?.id) {
          try {
            /* --- Isochronen holen ----------------------------------- */
            isoFC = await fetchUserIsochrones(user);

            isoFC.features.forEach((f: any) => {
              console.log(
                `[Iso ${f.id}] drawn_req_id: ${
                  f.properties?.drawn_req_id ?? "null"
                }, ` +
                  `address_req_id: ${f.properties?.address_req_id ?? "null"}`
              );
            });

            /* --- Flags, ob überhaupt Verknüpfungen existieren -------- */
            const drawnIds = isoFC.features
              .map((f: any) => f.properties?.drawn_req_id)
              .filter((id: number | undefined) => !!id) as number[];

            const addressIds = isoFC.features
              .map((f: any) => f.properties?.address_req_id)
              .filter((id: number | undefined) => !!id) as number[];

            /* --- Requests komplett laden (Variante A) ---------------- */
            if (drawnIds.length) drawnReqFC = await fetchDrawnRequests(user);
            if (addressIds.length)
              addressReqFC = await fetchUserSearchRequests(user);

            /* --- Jetzt auf die benötigten IDs herunterfiltern -------- */
            if (drawnReqFC.features.length) {
              drawnReqFC.features = drawnReqFC.features.filter((f: any) =>
                drawnIds.includes(f.id)
              );
            }

            if (addressReqFC.features.length) {
              addressReqFC.features = addressReqFC.features.filter((f: any) =>
                addressIds.includes(f.id)
              );
            }

            console.log("[MapPage] Isochrones:", isoFC);
            console.log("[MapPage] Drawn-Requests (gefiltert):", drawnReqFC);
            console.log(
              "[MapPage] Address-Requests (gefiltert):",
              addressReqFC
            );
          } catch (err) {
            console.warn(
              "⚠️  Laden von Isochronen/Requests fehlgeschlagen:",
              err
            );
          }
        }

        /* 4) MapComponent-Daten --------------------------------- */
        setFeatureCollection({
          type: "FeatureCollection",
          features: [
            ...jobsFC.features,
            ...isoFC.features,
            ...drawnReqFC.features,
            ...addressReqFC.features,
          ],
        });

        /* 5) LayerGroups für jede Isochrone -------------------- */
        /* 6) Gruppen-Layer pro Isochrone ---------------------------- */
        if (olMapRef.current) {
          /** alte Groups entfernen */
          olMapRef.current
            .getLayers()
            .getArray()
            .filter((l) => (l as any).get("layerType") === "searchAreaGroup")
            .forEach((l) => olMapRef.current!.removeLayer(l));

          /** Index: Jobs nach search_area_id (= Iso-ID) */
          const jobsByArea: Record<number, any[]> = {};
          jobsFC.features.forEach((feat: any) => {
            const key = feat.properties?.search_area_id;
            if (key) (jobsByArea[key] ||= []).push(feat);
          });

          /** Index: Drawn- & Address-Requests nach ID */
          const drawnReqMap: Record<number, any> = {};
          drawnReqFC.features.forEach((f: any) => (drawnReqMap[f.id] = f));

          const addressReqMap: Record<number, any> = {};
          addressReqFC.features.forEach((f: any) => (addressReqMap[f.id] = f));

          /** Für jede Isochrone eine Layer-Group -------------------- */
          isoFC.features.forEach((isoFeat: any, idx: number) => {
            const areaId = isoFeat.id; // Primär-Key
            const areaLabel =
              isoFeat.properties?.label ?? `Isochrone ${idx + 1}`;

            /** START-PUNKT holen (drawn *oder* address) */
            const reqPointFeat =
              drawnReqMap[isoFeat.properties?.drawn_req_id] ??
              addressReqMap[isoFeat.properties?.address_req_id] ??
              null;

            /** Polygon-Layer */
            const polyLayer = new VectorLayer({
              source: new VectorSource({
                features: [
                  new GeoJSON().readFeature(isoFeat, {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3857",
                  }),
                ],
              }),
              title: "Isochrone",
              type: "overlay",
              style: new Style({
                stroke: new Stroke({ color: "#ff1744", width: 2 }),
                fill: new Fill({ color: "rgba(255,23,68,0.15)" }),
              }),
            });

            /** Jobs-Layer */
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

            /** Request-Point-Layer (falls vorhanden) */
            let reqPointLayer: VectorLayer | null = null;
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

            /** Layers bündeln & Gruppe an Karte hängen */
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
