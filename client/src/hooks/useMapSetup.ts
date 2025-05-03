// useMapSetup.ts
import { useEffect } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import { Style, Icon } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import { defaults as defaultControls } from "ol/control";

export const useMapSetup = (
  mapRef: React.RefObject<Map | null>,
  mapElementRef: React.RefObject<HTMLDivElement | null>,
  vectorSourceRef: React.RefObject<VectorSource>,
  tempVectorSourceRef: React.RefObject<VectorSource>,
  fetchFunction: () => Promise<any> // ⬅️ HINZUGEFÜGT
) => {
  useEffect(() => {
    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: new Style({
        image: new Icon({
          src: "https://openlayers.org/en/latest/examples/data/icon.png",
          anchor: [0.5, 1],
        }),
      }),
    });

    const tempVectorLayer = new VectorLayer({
      source: tempVectorSourceRef.current,
      style: new Style({
        image: new Icon({
          src: "https://openlayers.org/en/latest/examples/data/icon.png",
          anchor: [0.5, 1],
          color: "#2196f3",
        }),
      }),
    });

    const map = new Map({
      target: mapElementRef.current!,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
        tempVectorLayer,
      ],
      view: new View({
        center: fromLonLat([13.405, 52.52]), // Berlin
        zoom: 12,
      }),
      controls: defaultControls(),
    });

    mapRef.current = map;

    // 🔄 Dynamischer Fetch
    fetchFunction()
      .then((data) => {
        const format = new GeoJSON();
        const features = format.readFeatures(data, {
          featureProjection: "EPSG:3857",
        });

        features.forEach((f: any) => {
          const props = f.getProperties().properties;
          if (props) {
            Object.entries(props).forEach(([key, value]) => {
              f.set(key, value);
            });
          }
        });

        vectorSourceRef.current.addFeatures(features);
      })
      .catch((err) => console.error("❌ Fehler beim Laden:", err));

    return () => {
      map.setTarget(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
