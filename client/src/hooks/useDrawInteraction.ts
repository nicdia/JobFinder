import { useEffect } from "react";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import { Map } from "ol";

export const useDrawInteraction = (
  mapRef: React.RefObject<Map | null>,
  drawRef: React.RefObject<Draw | null>,
  drawType: string | null,
  tempVectorSourceRef: React.RefObject<VectorSource>,
  setNewFeature: (f: any) => void,
  setDrawType: (type: string | null) => void
) => {
  useEffect(() => {
    if (!mapRef.current) return;

    if (drawRef.current) {
      mapRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    if (!drawType) return;

    const draw = new Draw({
      source: tempVectorSourceRef.current,
      type: drawType as any,
    });

    draw.on("drawend", (event) => {
      const feature = event.feature;
      tempVectorSourceRef.current.clear();
      tempVectorSourceRef.current.addFeature(feature);
      setNewFeature(feature);

      if (drawType === "Point") {
        mapRef.current?.removeInteraction(draw);
        drawRef.current = null;
        setDrawType(null);
      }
    });

    mapRef.current.addInteraction(draw);
    drawRef.current = draw;

    return () => {
      if (drawRef.current && mapRef.current) {
        mapRef.current.removeInteraction(drawRef.current);
      }
    };
  }, [drawType]);
};
