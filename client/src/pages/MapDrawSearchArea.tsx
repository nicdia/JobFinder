import { useRef, useState, useEffect } from "react";
import { Box } from "@mui/material";
import { Map } from "ol";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import MapComponent from "../components/Map/MapComponent";
import FeatureCreateDialog from "../components/UI/FeatureCreateDialogComponent";
import DrawToolbar from "../components/Map/DrawToolbarComponent";
import { useDraw } from "../hooks/useDraw";
import DragPan from "ol/interaction/DragPan";

const DrawAreaPage = () => {
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

    map.getInteractions().forEach((interaction) => {
      if (interaction instanceof DragPan) {
        interaction.setActive(!formOpen);
      }
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
  const handleSaveFeature = (data: {
    title: string;
    company: string;
    description: string;
  }) => {
    if (!newFeature) return;

    Object.entries(data).forEach(([key, value]) => newFeature.set(key, value));

    // TODO: Speichern oder API-Aufruf hier einbauen
    setFormOpen(false);
    setNewFeature(null);
    setDrawType(null);
    setIsDrawMode(false);
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <MapComponent
        mapRef={mapRef}
        fetchFunction={() => Promise.resolve([])}
        onFeatureClick={(f) => console.log("Feature", f)}
        disableFeatureInfo={isDrawMode} // ⬅️ während Draw: Pop‑up aus
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
        onSubmitDraw={() => {
          if (newFeature) setFormOpen(true);
        }}
      />

      {formOpen && (
        <FeatureCreateDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSaveFeature}
        />
      )}
    </Box>
  );
};

export default DrawAreaPage;
