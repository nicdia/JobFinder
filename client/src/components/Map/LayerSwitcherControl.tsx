import React, { useEffect } from "react";
import LayerSwitcher from "ol-layerswitcher";
import "ol-layerswitcher/dist/ol-layerswitcher.css";
import { Map } from "ol";

interface LayerSwitcherControlProps {
  map: Map;
}

const LayerSwitcherControl: React.FC<LayerSwitcherControlProps> = ({ map }) => {
  useEffect(() => {
    const control = new LayerSwitcher({
      activationMode: "hover",
      tipLabel: "Layers",
      startActive: false,
    });
    map.addControl(control);
    return () => {
      map.removeControl(control);
    };
  }, [map]);

  return null;
};

export default LayerSwitcherControl;
