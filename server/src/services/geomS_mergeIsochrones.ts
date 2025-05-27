import { unionOpsPolygon } from "../db/drawnRequestRepo";

/**
 * Funktion zum Mergen von Isochronen
 * (z.B. mehrere Polygone zu einem Multipolygon)
 */
export const mergeIsochrones = async (isochrones: any[]): Promise<any> => {
  const geoJSON = {
    type: "GeometryCollection",
    geometries: isochrones,
  };

  const mergedGeoJSONString = await unionOpsPolygon(geoJSON);

  if (!mergedGeoJSONString) {
    throw new Error("Fehler beim Mergen der Isochronen");
  }

  return JSON.parse(mergedGeoJSONString);
};
