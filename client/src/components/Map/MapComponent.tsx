import React, {
  forwardRef,
  MutableRefObject,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { Map } from "ol";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat } from "ol/proj";
import LayerSwitcher from "ol-layerswitcher";
import "ol-layerswitcher/dist/ol-layerswitcher.css";
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
  enableLayerSwitcher?: boolean;
};

const MapComponent = forwardRef<MapHandle, Props>(
  (
    {
      fetchFunction,
      onFeatureClick,
      mapRef,
      disableFeatureInfo = false,
      enableLayerSwitcher = true,
    },
    ref
  ) => {
    const mapDivRef = useRef<HTMLDivElement | null>(null);
    const internalMapRef = useRef<Map | null>(null);
    const usedMapRef = mapRef || internalMapRef;

    const vectorSrcRef = useRef(new VectorSource());
    const tempSrcRef = useRef(new VectorSource());

    // Setup base, overlay layers and view (only once)
    useMapSetup(usedMapRef, mapDivRef, vectorSrcRef, tempSrcRef);

    // Conditional LayerSwitcher
    useEffect(() => {
      if (!enableLayerSwitcher || !usedMapRef.current) return;
      const switcher = new LayerSwitcher({
        activationMode: "hover",
        tipLabel: "Layers",
      });
      usedMapRef.current.addControl(switcher);
      return () => {
        if (usedMapRef.current) usedMapRef.current.removeControl(switcher);
      };
    }, [enableLayerSwitcher]);

    // Reload GeoJSON when fetchFunction changes
    useEffect(() => {
      let cancelled = false;
      (async () => {
        const data = await fetchFunction();
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

    // Feature click handler
    useFeatureClickHandler(
      usedMapRef,
      null,
      (f) => onFeatureClick?.(f.getProperties ? f.getProperties() : f),
      disableFeatureInfo
    );

    // Expose zoomTo
    useImperativeHandle(ref, () => ({
      zoomTo(coord: [number, number], zoom = 14) {
        const view = usedMapRef.current?.getView();
        if (!view) return;
        view.animate({ center: fromLonLat(coord), zoom, duration: 400 });
      },
    }));

    return <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />;
  }
);

export default MapComponent;
