import { useRef, useState } from "react";
import { Map } from "ol";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";

import { useMapSetup } from "../../hooks/useMapSetup";
import { useFeatureClickHandler } from "../../hooks/useFeatureClickHandler";
import FeatureDetailsDialog from "../UI/FeatureDetailsDialogComponent";

import { MapComponentProps } from "../../types/types";

const MapComponent = ({
  fetchFunction,
  onFeatureClick,
  mapRef,
  disableFeatureInfo = false, // default: aktiv
}: Props) => {
  const mapElementRef = useRef<HTMLDivElement | null>(null);

  // Lokales mapRef als Fallback
  const internalMapRef = useRef<Map | null>(null);
  const usedMapRef = mapRef || internalMapRef;

  const vectorSourceRef = useRef(new VectorSource());
  const tempVectorSourceRef = useRef(new VectorSource());

  const [selectedFeature, setSelectedFeature] =
    useState<Feature<Geometry> | null>(null);

  useMapSetup(
    usedMapRef,
    mapElementRef,
    vectorSourceRef,
    tempVectorSourceRef,
    fetchFunction
  );

  useFeatureClickHandler(
    usedMapRef,
    null,
    (feature) => {
      setSelectedFeature(feature);
      onFeatureClick?.(feature);
    },
    disableFeatureInfo // ⬅️ hier steuern
  );

  return (
    <>
      <div ref={mapElementRef} style={{ width: "100%", height: "100%" }} />

      <FeatureDetailsDialog
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
      />
    </>
  );
};

export default MapComponent;
