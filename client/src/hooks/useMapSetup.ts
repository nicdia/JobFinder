import { useEffect } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import { fromLonLat } from "ol/proj";
import { Style, Icon } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import { defaults as defaultControls } from "ol/control";

export const useMapSetup = (
  mapRef: React.RefObject<Map | null>,
  mapElementRef: React.RefObject<HTMLDivElement | null>,
  vectorSourceRef: React.RefObject<VectorSource>,
  tempVectorSourceRef: React.RefObject<VectorSource>,
  fetchFunction: () => Promise<any>
) => {
  useEffect(() => {
    // Base layers
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

    // Overlay groups
    const jobsLayer = new VectorLayer({
      source: vectorSourceRef.current,
      title: "Jobs",
      type: "overlay",
      visible: true,
      style: new Style({
        image: new Icon({
          src: "https://openlayers.org/en/latest/examples/data/icon.png",
          anchor: [0.5, 1],
        }),
      }),
    });
    const tempJobsLayer = new VectorLayer({
      source: tempVectorSourceRef.current,
      title: "Temp Jobs",
      type: "overlay",
      visible: false,
      style: new Style({
        image: new Icon({
          src: "https://openlayers.org/en/latest/examples/data/icon.png",
          anchor: [0.5, 1],
          color: "#2196f3",
        }),
      }),
    });
    const overlayGroupJobs = new LayerGroup({
      title: "Jobs Group",
      layers: [jobsLayer],
    });
    const overlayGroupTemp = new LayerGroup({
      title: "Temp Jobs Group",
      layers: [tempJobsLayer],
    });

    // Initialize map without LayerSwitcher
    const map = new Map({
      target: mapElementRef.current!,
      layers: [baseGroup, overlayGroupJobs, overlayGroupTemp],
      view: new View({
        center: fromLonLat([9.9937, 53.5511]),
        zoom: 12,
      }),
      controls: defaultControls(),
    });
    mapRef.current = map;

    // Load initial GeoJSON
    fetchFunction()
      .then((data) => {
        const format = new GeoJSON();
        const features = format.readFeatures(data, {
          featureProjection: "EPSG:3857",
        });
        vectorSourceRef.current.addFeatures(features);
      })
      .catch((err) => console.error("Fehler beim Laden:", err));

    return () => map.setTarget(undefined);
  }, [
    fetchFunction,
    mapRef,
    mapElementRef,
    vectorSourceRef,
    tempVectorSourceRef,
  ]);
};
