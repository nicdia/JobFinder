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

import { unByKey } from "ol/Observable";
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
  const layerListenerKeys = useRef<any[]>([]); // hält alle Visibility-Listener
  const jobsByAreaRef = useRef<Record<number, JobItem[]>>({}); // Index der Jobs nach Iso-ID

  /* State ----------------------------------------------------- */
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [featureCollection, setFeatureCollection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const handleFeatureClick = useCallback((f: any) => setSelectedFeature(f), []);

  /* Sichtbare Jobs anhand der sichtbaren Layer-Groups ermitteln */
  const updateVisibleJobs = useCallback(() => {
    if (!olMapRef.current) return;

    const visibleAreaIds = olMapRef.current
      .getLayers()
      .getArray()
      .filter(
        (l) =>
          (l as any).get("layerType") === "searchAreaGroup" && l.getVisible()
      )
      .map((l) => (l as any).get("searchAreaId")) as number[];

    const visibleJobs: JobItem[] = [];
    visibleAreaIds.forEach((id) => {
      const arr = jobsByAreaRef.current[id];
      if (arr) visibleJobs.push(...arr);
    });

    setJobs(visibleJobs);
  }, []);

  /* Hilfsfunktionen ------------------------------------------ */
  const parseCreatedAt = (val: any): number | null => {
    if (!val && val !== 0) return null;
    if (typeof val === "number") {
      // Sekunden vs. Millisekunden heuristisch unterscheiden
      if (val < 1e12) return val * 1000;
      return val;
    }
    if (typeof val === "string") {
      const t = Date.parse(val);
      return isNaN(t) ? null : t;
    }
    return null;
  };

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

        /* --- Index für spätere Sichtbarkeits-Filter ----------- */
        const jobsByArea: Record<number, JobItem[]> = {};
        jobsFC.features.forEach((feat: any) => {
          const key = feat.properties?.search_area_id;
          if (!key) return;

          (jobsByArea[key] ||= []).push({
            id: feat.id,
            title: feat.properties?.title ?? "Job",
            company: feat.properties?.company,
            coord: feat.geometry.coordinates,
          });
        });
        jobsByAreaRef.current = jobsByArea;

        /* 2) Isochronen + Requests ------------------------------ */
        let isoFC = { type: "FeatureCollection", features: [] as any[] };
        let drawnReqFC = { type: "FeatureCollection", features: [] as any[] };
        let addressReqFC = { type: "FeatureCollection", features: [] as any[] };

        if (user?.id) {
          try {
            isoFC = await fetchUserIsochrones(user);

            const drawnIds = isoFC.features
              .map((f: any) => f.properties?.drawn_req_id)
              .filter(Boolean) as number[];

            const addressIds = isoFC.features
              .map((f: any) => f.properties?.address_req_id)
              .filter(Boolean) as number[];

            if (drawnIds.length) drawnReqFC = await fetchDrawnRequests(user);
            if (addressIds.length)
              addressReqFC = await fetchUserSearchRequests(user);

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
          } catch (err) {
            console.warn("⚠️  Laden Isochronen/Requests fehlgeschlagen:", err);
          }
        }

        /* 3) MapComponent-Daten -------------------------------- */
        setFeatureCollection({
          type: "FeatureCollection",
          features: [
            ...jobsFC.features,
            ...isoFC.features,
            ...drawnReqFC.features,
            ...addressReqFC.features,
          ],
        });

        /* 4) LayerGroups aufbauen ------------------------------ */
        if (olMapRef.current) {
          /** alte Search-Area-Groups entfernen */
          olMapRef.current
            .getLayers()
            .getArray()
            .filter((l) => (l as any).get("layerType") === "searchAreaGroup")
            .forEach((l) => olMapRef.current!.removeLayer(l));

          /** Listener der Vorgänger-Runde deaktivieren */
          layerListenerKeys.current.forEach(unByKey);
          layerListenerKeys.current = [];

          /** Index: Drawn- & Address-Requests */
          const drawnReqMap: Record<number, any> = {};
          drawnReqFC.features.forEach((f: any) => (drawnReqMap[f.id] = f));
          const addressReqMap: Record<number, any> = {};
          addressReqFC.features.forEach((f: any) => (addressReqMap[f.id] = f));

          /** Für jede Isochrone eine LayerGroup ----------------- */
          const createdGroups: LayerGroup[] = [];
          const groupsMeta: {
            group: LayerGroup;
            areaId: number | string;
            createdAt: number | null;
          }[] = [];

          isoFC.features.forEach((isoFeat: any, idx: number) => {
            const areaId = isoFeat.id;

            const drawnReqId = isoFeat.properties?.drawn_req_id;
            const addressReqId = isoFeat.properties?.address_req_id;

            const reqPointFeat =
              drawnReqMap[drawnReqId] ?? addressReqMap[addressReqId] ?? null;

            const areaLabel =
              (drawnReqId && drawnReqMap[drawnReqId]?.properties?.req_name) ||
              isoFeat.properties?.label ||
              `Isochrone ${idx + 1}`;

            // Erstellungszeit priorisieren: Isochrone -> zugehöriger drawn -> zugehöriger address
            const createdAt =
              parseCreatedAt(isoFeat?.properties?.created_at) ??
              parseCreatedAt(drawnReqMap[drawnReqId]?.properties?.created_at) ??
              parseCreatedAt(
                addressReqMap[addressReqId]?.properties?.created_at
              ) ??
              null;

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

            const jobLayer = new VectorLayer({
              source: new VectorSource({
                features: new GeoJSON().readFeatures(
                  {
                    type: "FeatureCollection",
                    features: (jobsFC.features as any[]).filter(
                      (f) => f.properties?.search_area_id === areaId
                    ),
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

            let reqPointLayer: VectorLayer | null = null;

            if (reqPointFeat) {
              const geomType = reqPointFeat.geometry?.type; // "Point" | "LineString" | …

              /* ---------- Punkt ---------- */
              if (geomType === "Point") {
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
              } else if (geomType === "LineString") {
                /* ---------- LineString ---------- */
                reqPointLayer = new VectorLayer({
                  source: new VectorSource({
                    features: [
                      new GeoJSON().readFeature(reqPointFeat, {
                        dataProjection: "EPSG:4326",
                        featureProjection: "EPSG:3857",
                      }),
                    ],
                  }),
                  title: "Gezeichnete Linie",
                  type: "overlay",
                  style: new Style({
                    stroke: new Stroke({ color: "#1976d2", width: 3 }),
                  }),
                });
              }
              /* ---------- weitere Geometrietypen optional ---------- */
            }

            const group = new LayerGroup({
              title: areaLabel,
              layers: reqPointLayer
                ? [polyLayer, jobLayer, reqPointLayer]
                : [polyLayer, jobLayer],
            });
            group.set("layerType", "searchAreaGroup");
            group.set("searchAreaId", areaId);

            const key = group.on("change:visible", updateVisibleJobs);
            layerListenerKeys.current.push(key);

            olMapRef.current!.addLayer(group);
            createdGroups.push(group);
            groupsMeta.push({ group, areaId, createdAt });
          });

          // --- Auswahl der aktiven Gruppe -----------------------
          const focusId = searchParams.get("focus"); // optional per Query
          let targetGroup: LayerGroup | null = null;

          if (focusId) {
            targetGroup =
              groupsMeta.find((g) => String(g.areaId) === String(focusId))
                ?.group ?? null;
          }

          if (!targetGroup) {
            // Wähle die Gruppe mit dem neuesten created_at, wenn vorhanden
            const withDates = groupsMeta.filter((g) => g.createdAt !== null);
            if (withDates.length > 0) {
              withDates.sort((a, b) => b.createdAt! - a.createdAt!);
              targetGroup = withDates[0].group;
            } else if (createdGroups.length > 0) {
              // Fallback: zuletzt erzeugte Gruppe
              targetGroup = createdGroups[createdGroups.length - 1];
            }
          }

          // Sichtbarkeit anwenden & Kinder synchronisieren
          createdGroups.forEach((g) => {
            const shouldBeVisible = g === targetGroup;
            g.setVisible(shouldBeVisible);
            g.getLayers()
              .getArray()
              .forEach((lyr: any) => lyr.setVisible(shouldBeVisible));
          });
        }

        /* 5) erste Synchronisierung der Job-Liste -------------- */
        updateVisibleJobs();
      } finally {
        setLoading(false);
      }
    }

    load();

    /* Cleanup: Listener entfernen ----------------------------- */
    return () => {
      layerListenerKeys.current.forEach(unByKey);
      layerListenerKeys.current = [];
    };
  }, [mode, user, updateVisibleJobs, searchParams]);

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
