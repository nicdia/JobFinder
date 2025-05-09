// useFeatureClickHandler.ts
import { useEffect, useRef } from "react";
import { Map } from "ol";
import { Select } from "ol/interaction";

export const useFeatureClickHandler = (
  mapRef: React.RefObject<Map | null>,
  layerFilter: any,
  onClick: (f: any) => void,
  disabled = false // ⬅️ neu
) => {
  const selectRef = useRef<Select | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Interaktion einmalig anlegen
    if (!selectRef.current) {
      selectRef.current = new Select({ layers: layerFilter });
      selectRef.current.on("select", (evt) => {
        if (evt.selected[0]) onClick(evt.selected[0]);
      });
      map.addInteraction(selectRef.current);
    }

    // 👉 je nach disabled ein‑/ausschalten
    selectRef.current.setActive(!disabled);

    return () => {
      // Clean‑Up bei Unmount
      if (selectRef.current) {
        map.removeInteraction(selectRef.current);
        selectRef.current = null;
      }
    };
  }, [mapRef, layerFilter, onClick, disabled]);
};
