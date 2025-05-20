// src/services/geomS_insertIsochrone.ts
import { insertIsochroneToDB } from "../db/geometryOpsRepo";
import { ImportIsochroneParams } from "../types/serverTypes";

/**
 * wrapper rund um insertIsochroneToDB (inkl. drawn/address-FK)
 */
export async function insertUserIsochrone({
  userId,
  label,
  cutoff,
  mode,
  center,
  geojsonPolygon,
  drawnReqId = null, // ⚠️ neu   (optional)
  addressReqId = null, // ⚠️ neu   (optional)
}: ImportIsochroneParams) {
  const [lon, lat] = center;
  const geometry = JSON.stringify(
    geojsonPolygon.type === "Feature" ? geojsonPolygon.geometry : geojsonPolygon
  );

  // 9 Parameter → drawn oder address darf genau einer gesetzt sein
  await insertIsochroneToDB(
    userId,
    label,
    cutoff,
    mode,
    lon,
    lat,
    geometry,
    drawnReqId,
    addressReqId
  );

  console.log(`✅ Isochrone für User ${userId} gespeichert.`);
}
