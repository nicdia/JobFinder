import { useEffect } from "react";
import { Map } from "ol";

export const useFeatureClickHandler = (
  mapRef: React.RefObject<Map | null>,
  drawType: string | null,
  setSelectedFeature: (feature: any | null) => void
) => {
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
};
