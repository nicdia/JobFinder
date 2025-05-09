import { useRef, useState, useEffect } from "react";
import { Box } from "@mui/material";
import { Map } from "ol";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import DragPan from "ol/interaction/DragPan";
import { useAuth } from "../context/AuthContext";
import MapComponent from "../components/Map/MapComponent";
import FeatureCreateDialog from "../components/Map/DrawModeCreateSearchDialogComponent";
import DrawToolbar from "../components/Map/DrawToolbarComponent";
import { useDraw } from "../hooks/useDraw";
import { saveSearchArea } from "../services/drawSearchRequestApi";

const DrawAreaPage = () => {
  const { user } = useAuth();
  // OpenLayers Refs
  const mapRef = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const tempVectorSourceRef = useRef(new VectorSource());

  // State
  const [drawType, setDrawType] = useState<
    "Polygon" | "Point" | "LineString" | null
  >(null);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [newFeature, setNewFeature] = useState<Feature<Geometry> | null>(null);

  // Effects
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.getInteractions().forEach((i) => {
      if (i instanceof DragPan) i.setActive(!formOpen);
    });
  }, [formOpen]);
  // Hook
  useDraw({
    mapRef,
    drawType,
    tempSource: tempVectorSourceRef,
    onDrawEnd: (feature) => {
      setNewFeature(feature);
      setFormOpen(true);
    },
  });
  // Speichern des Features
  const handleSaveFeature = async (formData: Record<string, string>) => {
    if (!newFeature || !mapRef.current) return;
    if (!user?.id || !user?.token) {
      alert("Bitte zuerst einloggen, um speichern zu können.");
      return;
    }
    try {
      /* 1)  Geometrie in GeoJSON umwandeln */
      const geojson = new GeoJSON();
      const geometry = geojson.writeGeometryObject(newFeature.getGeometry()!, {
        featureProjection: mapRef.current.getView().getProjection(), // Karten‑Proj.
        dataProjection: "EPSG:4326", // Backend‑Proj.
      });

      /* 3)  API‑Call */
      const res = await saveSearchArea({
        userId: user.id,
        token: user.token,
        geometry,
        formData,
      });
      console.log("✅ Data sent successfully:", res);

      console.log("✅ Data sent successfully:", res);
    } catch (err) {
      console.error("❌ Fehler beim Senden:", err);
    } finally {
      /* 4)  UI zurücksetzen */
      setFormOpen(false);
      setNewFeature(null);
      setDrawType(null);
      setIsDrawMode(false);
    }
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <MapComponent
        mapRef={mapRef}
        fetchFunction={() => Promise.resolve([])}
        onFeatureClick={(f) => console.log("Feature", f)}
        disableFeatureInfo={isDrawMode}
      />

      <DrawToolbar
        isDrawMode={isDrawMode}
        setIsDrawMode={setIsDrawMode}
        drawType={drawType}
        setDrawType={setDrawType}
        onAbortDraw={() => {
          if (drawRef.current && mapRef.current) {
            mapRef.current.removeInteraction(drawRef.current);
            drawRef.current = null;
          }
          tempVectorSourceRef.current.clear();
          setDrawType(null);
          setIsDrawMode(false);
        }}
        onSubmitDraw={() => newFeature && setFormOpen(true)}
      />

      {formOpen && (
        <FeatureCreateDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSaveFeature} // ⬅️  neuer Callback
        />
      )}
    </Box>
  );
};

export default DrawAreaPage;
