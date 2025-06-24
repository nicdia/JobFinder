// src/services/geometryService.ts
import {
  insertUserDrawnRequest,
  insertUserDrawnPolygon,
} from "../db/drawnRequestRepo";
import { matchJobsToPolygone } from "./geomS_matchJobsToIsochrone";
import { processPoints } from "./geomS_processPoints";
import { generatePointsFromLineString } from "./geomS_lineStringHandling";
import { buildOtpParamsFromDrawnInput } from "../utils/otpParamMapper";

/**
 * Hauptlogik zum Verarbeiten von Benutzereingaben:
 * - Polygon → Insert + Match
 * - Point   → OTP-Isochrone → Insert + Match
 * - LineStr → Punkte → OTP-Isochronen → Merge → Insert + Match
 */
export async function processRequestDrawnGeometry(
  userId: number,
  geometry: any,
  params: any
): Promise<{ message: string; points?: [number, number][] }> {
  /* ---------- Polygon -------------------------------------- */
  if (geometry.type === "Polygon") {
    const drawnId = await insertUserDrawnRequest(
      userId,
      geometry,
      params.reqName,
      params.jobType,
      params.transport,
      params.cutoff,
      params.speed
    );

    const searchAreaId = await insertUserDrawnPolygon(
      userId,
      geometry,
      drawnId
    );
    await matchJobsToPolygone(userId, searchAreaId);

    return { message: "Polygon gespeichert und Jobs gematcht" };
  }

  /* ---------- Point ---------------------------------------- */
  if (geometry.type === "Point") {
    const [lat, lon] = geometry.coordinates;

    // Address-Flow (bereits vorhandene addressReqId) -----------------
    if (params.addressReqId) {
      return processPoints({
        userId,
        coordinates: [[lon, lat]],
        params: { ...params }, // enthält addressReqId
      });
    }

    // Drawn-Flow -----------------------------------------------------
    const drawnId = await insertUserDrawnRequest(
      userId,
      geometry,
      params.reqName,
      params.jobType,
      params.transport,
      params.cutoff,
      params.speed
    );

    const otpParams = {
      ...buildOtpParamsFromDrawnInput(params),
      drawnReqId: drawnId,
    };

    return processPoints({
      userId,
      coordinates: [[lon, lat]],
      params: otpParams,
    });
  }

  /* ---------- LineString ----------------------------------- */
  /* ---------- LineString ----------------------------------- */
  if (geometry.type === "LineString") {
    const drawnId = await insertUserDrawnRequest(
      userId,
      geometry,
      params.reqName,
      params.jobType,
      params.transport,
      params.cutoff,
      params.speed
    );

    const points = generatePointsFromLineString(geometry.coordinates, 5);

    const otpParams = {
      ...buildOtpParamsFromDrawnInput(params),
      drawnReqId: drawnId,
      saveOnlyMerged: true, // ⬅️ sagt processPoints: nur Merge speichern
    };

    return processPoints({
      userId,
      coordinates: points,
      params: otpParams,
    });
  }

  /* ---------- Fallback ------------------------------------- */
  throw new Error("Unbekannter Geometrietyp");
}
