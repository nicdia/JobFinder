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
// add at top:
import LayerSwitcher from "ol-layerswitcher";
import "ol-layerswitcher/dist/ol-layerswitcher.css";

export const useMapSetup = (
  mapRef: React.RefObject<Map | null>,
  mapElementRef: React.RefObject<HTMLDivElement | null>,
  vectorSourceRef: React.RefObject<VectorSource>,
  tempVectorSourceRef: React.RefObject<VectorSource>,
  fetchFunction: () => Promise<any>
) => {
  useEffect(() => {
    // Base layer with title and type for switcher
    const baseLayer = new TileLayer({
      source: new OSM(),
      title: "OSM Base",
      type: "base",
      visible: true,
    });

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      title: "Jobs",
      type: "overlay",
      visible: true,
      style: new Style({
        image: new Icon({
          src: "https://openlayers.org/en/latest/examples/data/icon.png",
          anchor: [0.5, 1],
        }),
      }),
    });

    const tempVectorLayer = new VectorLayer({
      source: tempVectorSourceRef.current,
      title: "Temp Jobs",
      type: "overlay",
      visible: true,
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
      layers: [baseLayer, vectorLayer, tempVectorLayer],
      view: new View({
        center: fromLonLat([9.9937, 53.5511]),
        zoom: 12,
      }),
      controls: defaultControls(),
    });

    mapRef.current = map;

    // add LayerSwitcher control
    const layerSwitcherControl = new LayerSwitcher({
      tipLabel: "Layers",
      activationMode: "hover",
      startActive: false,
    });
    map.addControl(layerSwitcherControl);

    // load initial GeoJSON
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
  }, [
    fetchFunction,
    mapRef,
    mapElementRef,
    vectorSourceRef,
    tempVectorSourceRef,
  ]);
};
