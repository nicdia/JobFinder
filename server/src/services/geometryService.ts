// src/services/geometryService.ts
import { insertUserPolygon } from "../db/geometryOpsRepo";
import { matchJobsToPolygone } from "./geomS_matchJobsToIsochrone";
import { processPoints } from "./geomS_processPoints";
import { generatePointsFromLineString } from "./geomS_lineStringHandling";

/**
 * Hauptlogik zum Verarbeiten von Benutzereingaben:
 * - Polygon → Insert + Match
 * - Point → Isochrone-API → Insert + Match
 * - LineString → Punkte generieren + Isochrone-API → Zusammenführen der Isochronen + Insert + Match
 */
export async function processUserGeometry(
  userId: number,
  geometry: any,
  params: any
): Promise<{ message: string; points?: [number, number][] }> {
  // Verarbeitung des Polygons
  if (geometry.type === "Polygon") {
    await insertUserPolygon(userId, geometry);
    await matchJobsToPolygone(userId);
    return { message: "Polygon gespeichert und Jobs gematcht" };
  }

  // Verarbeitung des Points
  if (geometry.type === "Point") {
    const [lat, lon] = geometry.coordinates;
    return processPoints({
      userId,
      coordinates: [[lon, lat]], // Einfacher Fall: Ein Punkt
      params,
    });
  }

  // Verarbeitung des LineStrings
  if (geometry.type === "LineString") {
    // Punkte entlang des LineStrings generieren
    const points = generatePointsFromLineString(geometry.coordinates, 5); // Beispiel: 5 Punkte generieren
    console.log("📍 Generierte Punkte für OTP:", points);
    return processPoints({
      userId,
      coordinates: points, // Die Punkte werden dann genau so wie beim Point verarbeitet
      params,
    });
  }

  throw new Error("Unbekannter Geometrietyp");
}
