// src/services/DrawnRequestUpdateService.ts
import {
  getDrawnRequestById,
  updateDrawnRequestGeometry,
  clearDependentsForDrawn,
  insertUserDrawnPolygon,
} from "../db/drawnRequestRepo";
import { matchJobsToPolygone } from "./geomS_matchJobsToIsochrone";
import { processPoints } from "./geomS_processPoints";
import { buildOtpParamsFromDrawnInput } from "../utils/otpParamMapper";
import { generatePointsFromLineString } from "./geomS_lineStringHandling";

/**
 * Aktualisiert die Geometrie und triggert die richtige Folgeaktion:
 * - Polygon: neues Polygon als SearchArea speichern + Jobs matchen
 * - Point: OTP → Isochronen (wie Create)
 * - LineString: Punkte → OTP → Merge only
 */
export async function processUpdateDrawnGeometry(
  userId: number,
  requestId: number,
  geometry: any
) {
  // 0) Request lesen (Params)
  const req = await getDrawnRequestById(userId, requestId);
  if (!req) throw new Error("Suchauftrag nicht gefunden oder nicht erlaubt");

  // 1) Geometrie updaten
  const updated = await updateDrawnRequestGeometry(userId, requestId, geometry);
  if (!updated) throw new Error("Update fehlgeschlagen");

  // 2) Abhängige Daten bereinigen (alte Areas + Jobs zu diesem drawn_req_id)
  await clearDependentsForDrawn(userId, requestId);

  // 3) Branch je nach Geometrie
  if (geometry.type === "Polygon") {
    const searchAreaId = await insertUserDrawnPolygon(
      userId,
      geometry,
      requestId
    );
    await matchJobsToPolygone(userId, searchAreaId);
    return { kind: "polygon", searchAreaId };
  }

  if (geometry.type === "Point") {
    const [lon, lat] = geometry.coordinates;
    const otpParams = {
      ...buildOtpParamsFromDrawnInput({
        jobType: req.job_type,
        transport: req.transport_mode,
        cutoff: req.cutoff_seconds,
        speed: req.speed,
        reqName: req.req_name,
      }),
      drawnReqId: requestId,
    };

    await processPoints({
      userId,
      coordinates: [[lon, lat]],
      params: otpParams,
    });

    return { kind: "point" };
  }

  if (geometry.type === "LineString") {
    const pts = generatePointsFromLineString(geometry.coordinates, 5);
    const otpParams = {
      ...buildOtpParamsFromDrawnInput({
        jobType: req.job_type,
        transport: req.transport_mode,
        cutoff: req.cutoff_seconds,
        speed: req.speed,
        reqName: req.req_name,
      }),
      drawnReqId: requestId,
      saveOnlyMerged: true,
    };

    await processPoints({
      userId,
      coordinates: pts,
      params: otpParams,
    });

    return { kind: "line" };
  }

  throw new Error("Nicht unterstützter Geometrietyp");
}
