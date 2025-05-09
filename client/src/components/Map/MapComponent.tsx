import { MutableRefObject, useRef, useState } from "react";
import { Map } from "ol";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";

import { useMapSetup } from "../../hooks/useMapSetup";
import { useFeatureClickHandler } from "../../hooks/useFeatureClickHandler";
import FeatureDetailsDialog from "./FeatureDetailsDialogComponent";

import { MapComponentProps as BaseMapComponentProps } from "../../types/types";

/* ------------------------------------------------------------------ */
/* 🔧 Prop‑Typen ----------------------------------------------------- */
type Props = BaseMapComponentProps & {
  /** Wird ausgelöst, wenn der User einen Marker / ein Feature anklickt */
  onFeatureClick?: (feature: any) => void;
  /** Deaktiviert das Standard‑Popup der Map, falls true               */
  disableFeatureInfo?: boolean;
  /** Optional externer Map‑Ref – falls du die OL‑Instanz außerhalb brauchst */
  mapRef?: MutableRefObject<Map | null>;
};
/* ------------------------------------------------------------------ */

const MapComponent = ({
  fetchFunction,
  onFeatureClick,
  mapRef,
  disableFeatureInfo = false,
}: Props) => {
  /* ---------- Refs ------------------------------------------------ */
  const mapElementRef = useRef<HTMLDivElement | null>(null);

  // internes Fallback‑Ref für die OL‑Map, falls kein externes übergeben wird
  const internalMapRef = useRef<Map | null>(null);
  const usedMapRef = mapRef || internalMapRef;

  const vectorSourceRef = useRef(new VectorSource());
  const tempVectorSourceRef = useRef(new VectorSource());

  /* ---------- State ---------------------------------------------- */
  const [selectedFeature, setSelectedFeature] =
    useState<Feature<Geometry> | null>(null);

  /* ---------- Map‑Setup & Daten‑Fetch ----------------------------- */
  useMapSetup(
    usedMapRef,
    mapElementRef,
    vectorSourceRef,
    tempVectorSourceRef,
    fetchFunction
  );

  /* ---------- Klick‑Handler -------------------------------------- */
  useFeatureClickHandler(
    usedMapRef,
    null, // kein eigenes Overlay
    (feature: Feature<Geometry>) => {
      setSelectedFeature(feature); // Dialog öffnen
      // Roh‑Properties (GeoJSON‑artig) nach außen weiterreichen
      onFeatureClick?.(
        feature.getProperties ? feature.getProperties() : feature
      );
    },
    disableFeatureInfo
  );

  /* ---------- Render --------------------------------------------- */
  return (
    <>
      <div ref={mapElementRef} style={{ width: "100%", height: "100%" }} />

      <FeatureDetailsDialog
        feature={
          selectedFeature?.getProperties
            ? {
                ...selectedFeature.getProperties(),
                geometry: selectedFeature.getGeometry(),
              }
            : (selectedFeature as any)
        }
        onClose={() => setSelectedFeature(null)}
      />
    </>
  );
};

export default MapComponent;
