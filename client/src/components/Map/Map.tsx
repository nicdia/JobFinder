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
  const vectorSourceRef = useRef(new VectorSource()); // Dauerhaft gespeicherte Features
  const tempVectorSourceRef = useRef(new VectorSource()); // Nur temporäre Features

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

    const tempVectorLayer = new VectorLayer({
      source: tempVectorSourceRef.current,
      style: new Style({
        image: new Icon({
          src: "https://openlayers.org/en/latest/examples/data/icon.png",
          anchor: [0.5, 1],
          color: "#2196f3", // Blau für temporär
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
        center: fromLonLat([13.405, 52.52]),
        zoom: 12,
      }),
    });

    mapRef.current = map;

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
      source: tempVectorSourceRef.current, // Immer temporär!
      type: drawType as any,
    });

    draw.on("drawend", (event) => {
      const feature = event.feature;
      tempVectorSourceRef.current.clear(); // Immer nur 1 temporäres Feature
      tempVectorSourceRef.current.addFeature(feature);
      setNewFeature(feature); // nur merken, Dialog öffnet sich bei Button
    });

    mapRef.current.addInteraction(draw);
    drawRef.current = draw;

    return () => {
      if (drawRef.current && mapRef.current) {
        mapRef.current.removeInteraction(drawRef.current);
      }
    };
  }, [drawType]);

  // 🖱️ Rechtsklick = Zeichenmodus abbrechen + temporär löschen
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      if (!drawType) return;

      if (drawRef.current) {
        map.removeInteraction(drawRef.current);
        drawRef.current = null;
      }

      tempVectorSourceRef.current.clear(); // Temp löschen
      setDrawType(null);
      setFormOpen(false);
      setNewFeature(null);
    };

    const mapEl = map.getTargetElement();
    mapEl.addEventListener("contextmenu", handleContextMenu);

    return () => {
      mapEl.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [drawType]);

  // 🖱️ Klick auf bestehende Features (nur im normalen Modus!)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (event: any) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f);
      if (feature) {
        setSelectedFeature(feature.getProperties());
      } else {
        setSelectedFeature(null);
      }
    };

    if (drawType === null) {
      map.on("click", handleMapClick);
    }

    return () => {
      map.un("click", handleMapClick);
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

    // Entferne aus temporärer Quelle:
    tempVectorSourceRef.current.removeFeature(newFeature);

    // Füge zur "echten" Quelle hinzu:
    vectorSourceRef.current.addFeature(newFeature);

    console.log("📤 Neues Feature gespeichert:", newFeature);

    setNewFeature(null);
    setFormOpen(false);
    setDrawType(null);
  };

  const handleAbortDraw = () => {
    if (drawRef.current && mapRef.current) {
      mapRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    tempVectorSourceRef.current.clear(); // Temp löschen
    setNewFeature(null);
    setDrawType(null);
  };

  const handleSubmitDraw = () => {
    if (newFeature) {
      setFormOpen(true);
      setDrawType(null);
    }
  };

  return (
    <>
      <div ref={mapElementRef} style={{ width: "100%", height: "100vh" }} />
      <DrawToolbar
        drawType={drawType}
        setDrawType={setDrawType}
        onAbortDraw={handleAbortDraw}
        onSubmitDraw={handleSubmitDraw}
      />
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
