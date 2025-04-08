import { useEffect, useRef } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Overlay from "ol/Overlay";
import { Point } from "ol/geom";
import { Style, Icon } from "ol/style";

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Icon({
          src: "https://openlayers.org/en/latest/examples/data/icon.png",
          anchor: [0.5, 1],
        }),
      }),
    });

    const map = new Map({
      target: mapRef.current!,
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      view: new View({
        center: fromLonLat([13.405, 52.52]),
        zoom: 5,
      }),
    });

    const popup = new Overlay({
      element: popupRef.current!,
      positioning: "bottom-center",
      stopEvent: false,
      offset: [0, -30],
    });

    map.addOverlay(popup);

    map.on("click", (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f);
      if (feature) {
        const coords = (feature.getGeometry() as Point).getCoordinates();
        popup.setPosition(coords);

        // Direkt gespeicherte Attribute verwenden
        const title = feature.get("title");
        const company = feature.get("company");
        const description = feature.get("description");

        if (popupRef.current) {
          popupRef.current.innerHTML = `
            <strong>${title}</strong><br/>
            ${company}</strong><br/>${description}
          `;
        }
      } else {
        popup.setPosition(undefined);
      }
    });

    fetch("http://localhost:3001/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        const format = new GeoJSON();
        const features = format.readFeatures(data, {
          featureProjection: "EPSG:3857",
        });

        // 🔁 Properties aus "properties"-Objekt manuell zuweisen
        features.forEach((f: any) => {
          const props = f.getProperties().properties;
          if (props) {
            Object.entries(props).forEach(([key, value]) => {
              f.set(key, value);
            });
          }
        });

        vectorSource.addFeatures(features);
      })
      .catch((err) => console.error("❌ Fehler beim Laden der Jobs:", err));

    return () => map.setTarget(undefined);
  }, []);

  return (
    <>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <div ref={popupRef} />
    </>
  );
};

export default MapComponent;
