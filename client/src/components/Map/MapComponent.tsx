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

const MapComponent = forwardRef<MapHandle, Props>((props, ref) => {
  const {
    fetchFunction,
    onFeatureClick,
    mapRef,
    disableFeatureInfo = false,
    enableLayerSwitcher = true,
  } = props;

  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const internalMapRef = useRef<Map | null>(null);
  const usedMapRef = mapRef || internalMapRef;

  const vectorSrcRef = useRef(new VectorSource());
  const tempSrcRef = useRef(new VectorSource());

  // Container für die unten-mittige Control-Bar
  const controlBarRef = useRef<HTMLDivElement | null>(null);

  // Map + Controls initialisieren (inkl. controlBarRef)
  useMapSetup(usedMapRef, mapDivRef, vectorSrcRef, tempSrcRef, controlBarRef);

  // LayerSwitcher
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
  }, [enableLayerSwitcher, usedMapRef]);

  // GeoJSON nachladen, wenn fetchFunction sich ändert
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

  // Feature-Klicks
  useFeatureClickHandler(
    usedMapRef,
    null,
    (f) => onFeatureClick?.(f.getProperties ? f.getProperties() : f),
    disableFeatureInfo
  );

  // zoomTo-API bereitstellen
  useImperativeHandle(ref, () => ({
    zoomTo(coord: [number, number], zoom = 14) {
      const view = usedMapRef.current?.getView();
      if (!view) return;
      view.animate({ center: fromLonLat(coord), zoom, duration: 400 });
    },
  }));

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Karte */}
      <div ref={mapDivRef} style={{ position: "absolute", inset: 0 }} />

      {/* Unten-mittige Control-Bar als Target für OL-Controls */}
      <div
        ref={controlBarRef}
        className="ol-custom-control-bar"
        style={{
          position: "absolute",
          left: "50%",
          bottom: 16,
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          zIndex: 1200,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(4px)",
          borderRadius: 14,
          boxShadow: "0 8px 22px rgba(0,0,0,0.14)",
          padding: "6px 8px",
          pointerEvents: "auto",
        }}
      />

      <style>{`
        .ol-custom-control-bar .ol-control { background: transparent; box-shadow: none; margin: 0; }
        .ol-custom-control-bar .ol-zoom { display: inline-flex; gap: 6px; padding: 0 2px; }
        .ol-custom-control-bar .ol-zoom button {
          width: 40px; height: 40px; font-size: 20px; line-height: 40px;
          border-radius: 10px; background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.06);
        }
        .ol-custom-control-bar .ol-scale-line {
          padding: 6px 10px; border-radius: 10px;
          background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.06);
        }
        .ol-custom-control-bar .ol-scale-line-inner {
          border-color: rgba(0,0,0,0.7);
          font-size: 14px; letter-spacing: 0.2px;
        }
        .ol-custom-control-bar .ol-scale-ratio {
          padding: 6px 10px; border-radius: 10px; margin-left: 2px;
          background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.06);
          font-size: 14px; display: inline-flex; gap: 6px; align-items: center;
        }
        .ol-custom-control-bar .ol-scale-ratio-label { opacity: 0.7; }
      `}</style>
    </div>
  );
});

export default MapComponent;
