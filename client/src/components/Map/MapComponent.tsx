import {
  forwardRef,
  MutableRefObject,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { Map } from "ol";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import View from "ol/View";
import { fromLonLat } from "ol/proj";

import { useMapSetup } from "../../hooks/useMapSetup";
import { useFeatureClickHandler } from "../../hooks/useFeatureClickHandler";
import FeatureDetailsDialog from "./FeatureDetailsDialogComponent";
import { MapComponentProps as BaseProps } from "../../types/types";
import GeoJSON from "ol/format/GeoJSON";
/* ---------- public handle (zoomTo) ------------------------------- */
export interface MapHandle {
  zoomTo: (coord: [number, number], zoom?: number) => void;
}

/* ---------- props ------------------------------------------------ */
type Props = BaseProps & {
  onFeatureClick?: (feature: any) => void;
  disableFeatureInfo?: boolean;
  mapRef?: MutableRefObject<Map | null>;
};

const MapComponent = forwardRef<MapHandle, Props>(
  (
    { fetchFunction, onFeatureClick, mapRef, disableFeatureInfo = false },
    ref
  ) => {
    /* refs -------------------------------------------------------- */
    const mapDivRef = useRef<HTMLDivElement | null>(null);
    const internalMapRef = useRef<Map | null>(null);
    const usedMapRef = mapRef || internalMapRef;

    const vectorSrcRef = useRef(new VectorSource());
    const tempSrcRef = useRef(new VectorSource());

    /* selected feature dialog ------------------------------------ */
    const [selectedFeature, setSelectedFeature] =
      useState<Feature<Geometry> | null>(null);

    /* map setup --------------------------------------------------- */
    useMapSetup(usedMapRef, mapDivRef, vectorSrcRef, tempSrcRef, fetchFunction);
    useEffect(() => {
      let cancelled = false;

      async function loadNew() {
        const data = await fetchFunction(); // FeatureCollection
        if (cancelled) return;

        const features = new GeoJSON().readFeatures(data, {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        });

        vectorSrcRef.current.clear();
        vectorSrcRef.current.addFeatures(features);
      }

      loadNew();

      return () => {
        cancelled = true;
      };
    }, [fetchFunction]);
    /* click handler ---------------------------------------------- */
    useFeatureClickHandler(
      usedMapRef,
      null,
      (f) => {
        setSelectedFeature(f);
        onFeatureClick?.(f.getProperties ? f.getProperties() : f);
      },
      disableFeatureInfo
    );

    /* expose zoomTo ---------------------------------------------- */
    useImperativeHandle(ref, () => ({
      zoomTo(coord: [number, number], zoom = 14) {
        const map = usedMapRef.current;
        if (!map) return;
        const view: View = map.getView();
        view.animate({
          center: fromLonLat(coord),
          zoom,
          duration: 400,
        });
      },
    }));

    /* render ------------------------------------------------------ */
    return (
      <>
        <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
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
  }
);

export default MapComponent;
