// src/hooks/useMapSetup.ts
import { useEffect } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";

export const useMapSetup = (
  mapRef: React.RefObject<Map | null>,
  mapElementRef: React.RefObject<HTMLDivElement | null>,
  vectorSourceRef: React.RefObject<VectorSource>,
  tempVectorSourceRef: React.RefObject<VectorSource>
) => {
  useEffect(() => {
    // 1) Basemaps
    const osmLayer = new TileLayer({
      source: new OSM(),
      title: "OSM Standard",
      type: "base",
      visible: true,
    });
    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attributions: "Tiles © Esri — Source: Esri, NOAA, USGS, etc.",
      }),
      title: "Satellite",
      type: "base",
      visible: false,
    });
    const baseGroup = new LayerGroup({
      title: "Basemaps",
      layers: [osmLayer, satelliteLayer],
    });

    // 3) Karte initialisieren (nur einmal!)
    const map = new Map({
      target: mapElementRef.current!,
      layers: [baseGroup],
      view: new View({
        center: fromLonLat([9.9937, 53.5511]),
        zoom: 12,
      }),
      controls: defaultControls(),
    });
    mapRef.current = map;

    // Cleanup
    return () => {
      map.setTarget(undefined);
    };
  }, [mapRef, mapElementRef, vectorSourceRef, tempVectorSourceRef]);
};
