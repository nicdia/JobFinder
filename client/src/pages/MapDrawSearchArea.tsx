// src/pages/MapDrawSearchArea.tsx (DrawAreaPage)
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
import AppHeader from "../components/UI/AppHeaderComponent";
import { useDraw } from "../hooks/useDraw";
import { saveSearchArea } from "../services/postDrawSearchRequestApi";

// 👇 NEU
import { useNavigate } from "react-router-dom";

const DrawAreaPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // 👈 NEU

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getInteractions().forEach((i) => {
      if (i instanceof DragPan) i.setActive(!formOpen);
    });
  }, [formOpen]);

  useDraw({
    mapRef,
    drawType,
    tempSource: tempVectorSourceRef,
    onDrawEnd: (feature) => {
      setNewFeature(feature);
      setFormOpen(true);
    },
  });

  const handleSaveFeature = async (formData: Record<string, string>) => {
    if (!newFeature || !mapRef.current) return;
    if (!user?.id || !user?.token) {
      alert("Bitte zuerst einloggen, um speichern zu können.");
      return;
    }
    try {
      const geojson = new GeoJSON();
      const geometry = geojson.writeGeometryObject(newFeature.getGeometry()!, {
        featureProjection: mapRef.current.getView().getProjection(),
        dataProjection: "EPSG:4326",
      });

      const res = await saveSearchArea({
        userId: user.id,
        token: user.token,
        geometry,
        formData,
      });
      console.log("✅ Data sent successfully:", res);

      // 👉 Direkt nach MapPage leiten, die die sichtbaren Jobs lädt
      navigate("/found-jobs?mode=customVisible", { replace: true });
    } catch (err) {
      console.error("❌ Fehler beim Senden:", err);
    } finally {
      setFormOpen(false);
      setNewFeature(null);
      setDrawType(null);
      setIsDrawMode(false);
    }
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <AppHeader />
      <MapComponent
        mapRef={mapRef}
        fetchFunction={() => Promise.resolve([])}
        onFeatureClick={(f) => console.log("Feature", f)}
        disableFeatureInfo={isDrawMode}
        enableLayerSwitcher={false}
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
          onSave={handleSaveFeature}
          geometryType={drawType as any}
        />
      )}
    </Box>
  );
};

export default DrawAreaPage;
