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
import Control from "ol/control/Control";
import TileWMS from "ol/source/TileWMS";

export const useMapSetup = (
  mapRef: React.RefObject<Map | null>,
  mapElementRef: React.RefObject<HTMLDivElement | null>,
  _vectorSourceRef: React.RefObject<VectorSource>,
  _tempVectorSourceRef: React.RefObject<VectorSource>,
  controlBarRef?: React.RefObject<HTMLDivElement | null>
) => {
  useEffect(() => {
    // --- Basemaps ---
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

    // --- Verwaltungsgrenzen WMS (Geoportal HH) ---
    const wmsUrl = "https://geodienste.hamburg.de/HH_WMS_Verwaltungsgrenzen?";

    const landesgrenzeLayer = new TileLayer({
      source: new TileWMS({
        url: wmsUrl,
        params: {
          LAYERS: "landesgrenze",
          STYLES: "default",
          FORMAT: "image/png",
          TRANSPARENT: true,
          VERSION: "1.3.0",
        },
        attributions:
          "Daten: FHH/LGV – ALKIS Verwaltungsgrenzen (Landesgrenze)",
        crossOrigin: "anonymous",
      }),
      title: "Hamburg Landesgrenze (WMS)",
      type: "overlay",
      visible: true,
      opacity: 1,
    });

    const bezirkeLayer = new TileLayer({
      source: new TileWMS({
        url: wmsUrl,
        params: {
          LAYERS: "bezirke",
          STYLES: "default",
          FORMAT: "image/png",
          TRANSPARENT: true,
          VERSION: "1.3.0",
        },
        attributions: "Daten: FHH/LGV – ALKIS Verwaltungsgrenzen (Bezirke)",
        crossOrigin: "anonymous",
      }),
      title: "Hamburg Bezirksgrenzen (WMS)",
      type: "overlay",
      visible: true,
      opacity: 1,
    });

    baseGroup.getLayers().push(landesgrenzeLayer);
    baseGroup.getLayers().push(bezirkeLayer);

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

    map.addControl(new Zoom({ target }));
    map.addControl(
      new ScaleLine({
        target,
        units: "metric",
        bar: false,
        text: true,
        minWidth: 120,
      })
    );

    const ratioEl = document.createElement("div");
    ratioEl.className = "ol-scale-ratio ol-unselectable ol-control";
    ratioEl.innerHTML = `<span class="ol-scale-ratio-label">1 :</span><span class="ol-scale-ratio-value">–</span>`;
    map.addControl(new Control({ element: ratioEl, target }));

    const updateRatio = () => {
      const view = map.getView();
      const res = view.getResolution();
      if (!res) return;
      const mpu = view.getProjection()?.getMetersPerUnit?.() ?? 1;
      const DPI = 96;
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
