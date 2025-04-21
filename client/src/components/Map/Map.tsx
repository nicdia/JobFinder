import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Icon } from "ol/style";
import { Draw } from "ol/interaction";
import { fetchJobs } from "../../services/jobsApi";
import DrawToolbar from "../UI/DrawToolbar";
import FeatureDetailsDialog from "../UI/FeatureDetailsDialog";
import FeatureCreateDialog from "../UI/FeatureCreateDialog";

const MapComponent = () => {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const vectorSourceRef = useRef(new VectorSource());

  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [drawType, setDrawType] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState<any | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // 🗺️ Map initialisieren
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

    const map = new Map({
      target: mapElementRef.current!,
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      view: new View({
        center: fromLonLat([13.405, 52.52]),
        zoom: 12,
      }),
    });

    mapRef.current = map;

    // Feature-Klick
    map.on("click", (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f);
      if (feature) {
        setSelectedFeature(feature.getProperties());
      } else {
        setSelectedFeature(null);
      }
    });

    // Features laden
    fetchJobs()
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
      .catch((err) => console.error("❌ Fehler beim Laden der Jobs:", err));

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // ✏️ Zeichenmodus aktivieren/deaktivieren
  useEffect(() => {
    if (!mapRef.current) return;

    if (drawRef.current) {
      mapRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    if (!drawType) return;

    const draw = new Draw({
      source: vectorSourceRef.current,
      type: drawType as any,
    });

    draw.on("drawend", (event) => {
      const feature = event.feature;

      // Zeichnen abgeschlossen → Formular öffnen
      setNewFeature(feature);
      setFormOpen(true);
    });

    mapRef.current.addInteraction(draw);
    drawRef.current = draw;

    return () => {
      if (drawRef.current && mapRef.current) {
        mapRef.current.removeInteraction(drawRef.current);
      }
    };
  }, [drawType]);

  // 🖱️ Rechtsklick zum Öffnen des Formulars (optional)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // blockiert Browser-Menü

      if (!drawType) return;

      const feature = vectorSourceRef.current.getFeatures().slice(-1)[0]; // letzter = gezeichneter
      if (feature) {
        setNewFeature(feature);
        setFormOpen(true);
      }
    };

    const mapEl = map.getTargetElement();
    mapEl.addEventListener("contextmenu", handleContextMenu);

    return () => {
      mapEl.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [drawType]);

  // 💾 Feature speichern
  const handleSaveFeature = (data: {
    title: string;
    company: string;
    description: string;
  }) => {
    if (!newFeature) return;

    Object.entries(data).forEach(([key, value]) => {
      newFeature.set(key, value);
    });

    // Optional: an API senden
    console.log("📤 Neues Feature gespeichert:", newFeature);

    setNewFeature(null);
    setFormOpen(false);
    setDrawType(null); // Zeichnen beenden
  };

  return (
    <>
      <div ref={mapElementRef} style={{ width: "100%", height: "100vh" }} />
      <DrawToolbar drawType={drawType} setDrawType={setDrawType} />
      <FeatureDetailsDialog
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
      />
      {formOpen && (
        <div
          style={{
            position: "absolute",
            zIndex: 1500,
            inset: 0,
            pointerEvents: "auto",
          }}
        >
          <FeatureCreateDialog
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSave={handleSaveFeature}
          />
        </div>
      )}
    </>
  );
};

export default MapComponent;
