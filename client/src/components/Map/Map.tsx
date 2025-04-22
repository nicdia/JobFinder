import { useRef, useState } from "react";
import { Map } from "ol";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";

import { useMapSetup } from "../../hooks/useMapSetup";
import { useDrawInteraction } from "../../hooks/useDrawInteraction";
import { useContextMenuHandler } from "../../hooks/useContextMenuHandler";
import { useFeatureClickHandler } from "../../hooks/useFeatureClickHandler";

import DrawToolbar from "../UI/DrawToolbar";
import FeatureDetailsDialog from "../UI/FeatureDetailsDialog";
import FeatureCreateDialog from "../UI/FeatureCreateDialog";

const MapComponent = () => {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const vectorSourceRef = useRef(new VectorSource());
  const tempVectorSourceRef = useRef(new VectorSource());

  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [drawType, setDrawType] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState<any | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // Hooks
  useMapSetup(mapRef, mapElementRef, vectorSourceRef, tempVectorSourceRef);
  useDrawInteraction(
    mapRef,
    drawRef,
    drawType,
    tempVectorSourceRef,
    setNewFeature,
    setDrawType
  );
  useContextMenuHandler(
    mapRef,
    drawRef,
    drawType,
    tempVectorSourceRef,
    setDrawType,
    setFormOpen,
    setNewFeature
  );
  useFeatureClickHandler(mapRef, drawType, setSelectedFeature);

  // 💾 Feature speichern
  const handleSaveFeature = (data: {
    title: string;
    company: string;
    description: string;
  }) => {
    if (!newFeature) return;

    Object.entries(data).forEach(([key, value]) => newFeature.set(key, value));
    tempVectorSourceRef.current.removeFeature(newFeature);
    vectorSourceRef.current.addFeature(newFeature);

    setNewFeature(null);
    setFormOpen(false);
    setDrawType(null);
  };

  const handleAbortDraw = () => {
    if (drawRef.current && mapRef.current) {
      mapRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }
    tempVectorSourceRef.current.clear();
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
