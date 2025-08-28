import { useEffect } from "react";
import { Map } from "ol";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import DragPan from "ol/interaction/DragPan";

type DrawType = "Point" | "LineString" | "Polygon" | null;

interface UseDrawProps {
  mapRef: React.RefObject<Map | null>;
  drawType: DrawType;
  tempSource: React.RefObject<VectorSource>;
  onDrawEnd: (feature: Feature<Geometry>) => void;
}

export const useDraw = ({
  mapRef,
  drawType,
  tempSource,
  onDrawEnd,
}: UseDrawProps) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !drawType) return;

    const draw = new Draw({
      source: tempSource.current,
      type: drawType,
    });

    draw.on("drawstart", () => {
      map.getInteractions().forEach((interaction) => {
        if (interaction instanceof DragPan) {
          interaction.setActive(false);
        }
      });
    });

    draw.on("drawend", (event) => {
      const feature = event.feature;
      tempSource.current.clear();
      tempSource.current.addFeature(feature);
      map.removeInteraction(draw);

      setTimeout(() => {
        map.getInteractions().forEach((interaction) => {
          if (interaction instanceof DragPan) {
            interaction.setActive(true);
          }
        });

        onDrawEnd(feature);
      }, 0);
    });

    map.addInteraction(draw);

    return () => {
      map.removeInteraction(draw);
      map.getInteractions().forEach((interaction) => {
        if (interaction instanceof DragPan) {
          interaction.setActive(true);
        }
      });
    };
  }, [drawType, mapRef, tempSource, onDrawEnd]);
};
