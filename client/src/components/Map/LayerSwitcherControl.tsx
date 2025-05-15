// src/components/Map/LayerSwitcherControl.tsx
import React, { useEffect } from "react";
import LayerSwitcher from "ol-layerswitcher";
import "ol-layerswitcher/dist/ol-layerswitcher.css";
import { Map } from "ol";

interface LayerSwitcherControlProps {
  map: Map | null;
}

const LayerSwitcherControl: React.FC<LayerSwitcherControlProps> = ({ map }) => {
  useEffect(() => {
    if (!map) return;
    const layerSwitcher = new LayerSwitcher({
      activationMode: "click", // or 'hover'
      startActive: false,
    });
    map.addControl(layerSwitcher);
    return () => {
      map.removeControl(layerSwitcher);
    };
  }, [map]);

  return null;
};

export default LayerSwitcherControl;
