import pool from "../utils/db";
import { ImportIsochroneParams } from "../types/serverTypes";
import { insertIsochroneToDB } from "../db/geometryOpsRepo";

export async function insertUserIsochrone({
  userId,
  label,
  cutoff,
  mode,
  center,
  geojsonPolygon,
}: ImportIsochroneParams) {
  const [lon, lat] = center;

  const geometry = JSON.stringify(
    geojsonPolygon.type === "Feature" ? geojsonPolygon.geometry : geojsonPolygon // falls nur Geometry übergeben wird
  );

  await insertIsochroneToDB(userId, label, cutoff, mode, lon, lat, geometry);

  console.log(`✅ Isochrone für User ${userId} gespeichert.`);
}
