import { useEffect } from "react";
import { Map } from "ol";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";

export const useContextMenuHandler = (
  mapRef: React.RefObject<Map | null>,
  drawRef: React.RefObject<Draw | null>,
  drawType: string | null,
  tempVectorSourceRef: React.RefObject<VectorSource>,
  setDrawType: (type: string | null) => void,
  setFormOpen: (open: boolean) => void,
  setNewFeature: (feature: any | null) => void
) => {
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

      tempVectorSourceRef.current.clear();
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
};
