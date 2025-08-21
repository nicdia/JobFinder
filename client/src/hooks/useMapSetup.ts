import { useEffect } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import Zoom from "ol/control/Zoom";
import ScaleLine from "ol/control/ScaleLine";
import Control from "ol/control/Control"; // ⬅️ wichtig!

export const useMapSetup = (
  mapRef: React.RefObject<Map | null>,
  mapElementRef: React.RefObject<HTMLDivElement | null>,
  _vectorSourceRef: React.RefObject<VectorSource>,
  _tempVectorSourceRef: React.RefObject<VectorSource>,
  controlBarRef?: React.RefObject<HTMLDivElement | null>
) => {
  useEffect(() => {
    // Basemaps
    const osmLayer = new TileLayer({
      source: new OSM(),
      title: "OSM Standard",
      type: "base",
      visible: true,
    });
    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attributions: "Tiles © Esri — Source: Esri, NOAA, USGS, etc.",
      }),
      title: "Satellite",
      type: "base",
      visible: false,
    });
    const baseGroup = new LayerGroup({
      title: "Basemaps",
      layers: [osmLayer, satelliteLayer],
    });

    // Map
    const map = new Map({
      target: mapElementRef.current!,
      layers: [baseGroup],
      view: new View({ center: fromLonLat([9.9937, 53.5511]), zoom: 12 }),
      controls: defaultControls({
        zoom: false,
        attribution: false,
        rotate: false,
      }),
    });
    mapRef.current = map;

    const target = controlBarRef?.current ?? undefined;

    // Zoom-Buttons
    map.addControl(new Zoom({ target }));

    // Maßstabsleiste (schlank, ohne Balken)
    map.addControl(
      new ScaleLine({
        target,
        units: "metric",
        bar: false,
        text: true, // z.B. "500 m" / "2 km"
        minWidth: 120,
      })
    );

    // "1 : N" Maßstabszahl
    const ratioEl = document.createElement("div");
    ratioEl.className = "ol-scale-ratio ol-unselectable ol-control";
    ratioEl.innerHTML = `<span class="ol-scale-ratio-label">1 :</span><span class="ol-scale-ratio-value">–</span>`;
    const ratioCtrl = new Control({ element: ratioEl, target });
    map.addControl(ratioCtrl);

    const updateRatio = () => {
      const view = map.getView();
      const res = view.getResolution();
      if (!res) return;
      const mpu = view.getProjection()?.getMetersPerUnit?.() ?? 1;
      const DPI = 96; // OpenLayers Default
      const INCHES_PER_M = 39.37;
      const scale = Math.round(res * mpu * DPI * INCHES_PER_M);
      ratioEl.querySelector(".ol-scale-ratio-value")!.textContent =
        scale.toLocaleString();
    };
    map.on("moveend", updateRatio);
    updateRatio();

    return () => {
      map.setTarget(undefined);
    };
  }, [mapRef, mapElementRef, controlBarRef]);
};
