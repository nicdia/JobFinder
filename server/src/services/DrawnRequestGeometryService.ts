// src/services/geometryService.ts
import {
  insertUserDrawnRequest,
  insertUserDrawnPolygon,
} from "../db/drawnRequestRepo";
import { matchJobsToPolygone } from "./geomS_matchJobsToIsochrone";
import { processPoints } from "./geomS_processPoints";
import { generatePointsFromLineString } from "./geomS_lineStringHandling";

/**
 * Hauptlogik zum Verarbeiten von Benutzereingaben:
 * - Polygon → Insert + Match
 * - Point → Isochrone-API → Insert + Match
 * - LineString → Punkte generieren + Isochrone-API → Zusammenführen der Isochronen + Insert + Match
 */
export async function processRequestDrawnGeometry(
  userId: number,
  geometry: any,
  params: any
): Promise<{ message: string; points?: [number, number][] }> {
  // Verarbeitung des Polygons
  if (geometry.type === "Polygon") {
    const drawnId = await insertUserDrawnRequest(
      userId,
      geometry,
      params.reqName
    );
    console.log(`this is drawn id: ${drawnId}`);
    const searchAreaId = await insertUserDrawnPolygon(
      userId,
      geometry,
      drawnId
    );
    await matchJobsToPolygone(userId, searchAreaId);
    return { message: "Polygon gespeichert und Jobs gematcht" };
  }

  // Verarbeitung des Points
  if (geometry.type === "Point") {
    const [lat, lon] = geometry.coordinates;

    if (params.addressReqId) {
      // ➜ Address-Flow: KEIN Drawn-Request anlegen
      return processPoints({
        userId,
        coordinates: [[lon, lat]],
        params: { ...params }, // enthält addressReqId
      });
    }

    // ➜ Drawn-Flow:
    const drawnId = await insertUserDrawnRequest(
      userId,
      geometry,
      params.reqName
    );
    return processPoints({
      userId,
      coordinates: [[lon, lat]],
      params: { ...params, drawnReqId: drawnId },
    });
  }

  // Verarbeitung des LineStrings
  if (geometry.type === "LineString") {
    const drawnId = await insertUserDrawnRequest(
      userId,
      geometry,
      params.reqName
    );

    const points = generatePointsFromLineString(geometry.coordinates, 5);
    console.log("📍 Generierte Punkte für OTP:", points);

    return processPoints({
      userId,
      coordinates: points,
      params: { ...params, drawnReqId: drawnId }, // ⚠️ hier
    });
  }

  throw new Error("Unbekannter Geometrietyp");
}
