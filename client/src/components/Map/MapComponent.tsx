import {
  forwardRef,
  MutableRefObject,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { Map } from "ol";
import VectorSource from "ol/source/Vector";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";

import { useMapSetup } from "../../hooks/useMapSetup";
import { useFeatureClickHandler } from "../../hooks/useFeatureClickHandler";
import { MapComponentProps as BaseProps } from "../../types/types";

export interface MapHandle {
  zoomTo: (coord: [number, number], zoom?: number) => void;
}

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
    /* Refs -------------------------------------------------------- */
    const mapDivRef = useRef<HTMLDivElement | null>(null);
    const internalMapRef = useRef<Map | null>(null);
    const usedMapRef = mapRef || internalMapRef;

    const vectorSrcRef = useRef(new VectorSource());
    const tempSrcRef = useRef(new VectorSource());

    /* Map-Setup --------------------------------------------------- */
    useMapSetup(usedMapRef, mapDivRef, vectorSrcRef, tempSrcRef, fetchFunction);

    /* Re-load GeoJSON on fetchFunction change -------------------- */
    useEffect(() => {
      let cancelled = false;
      (async () => {
        const data = await fetchFunction(); // FeatureCollection
        if (cancelled) return;

        const features = new GeoJSON().readFeatures(data, {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        });
        vectorSrcRef.current.clear();
        vectorSrcRef.current.addFeatures(features);
      })();

      return () => {
        cancelled = true;
      };
    }, [fetchFunction]);

    /* Klick-Handler → nur nach außen weiterreichen --------------- */
    useFeatureClickHandler(
      usedMapRef,
      null,
      (f) => onFeatureClick?.(f.getProperties ? f.getProperties() : f),
      disableFeatureInfo
    );

    /* expose zoomTo ---------------------------------------------- */
    useImperativeHandle(ref, () => ({
      zoomTo(coord: [number, number], zoom = 14) {
        const view: View | undefined = usedMapRef.current?.getView();
        if (!view) return;
        view.animate({
          center: fromLonLat(coord),
          zoom,
          duration: 400,
        });
      },
    }));

    /* Render ------------------------------------------------------ */
    return <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />;
  }
);

export default MapComponent;
