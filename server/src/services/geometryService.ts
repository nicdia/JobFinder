import pool from "../utils/db";
import { matchJobsToPolygone } from "./matchJobsToIsochrone";
import { fetchOtpApi } from "./fetchIsochrone";
import { insertUserIsochrone } from "./importIsochrone";
import { insertUserPolygon } from "../db/polygonRepo";

/**
 * Hauptlogik zum Verarbeiten von Benutzereingaben:
 * - Polygon → Insert + Match
 * - Point → Isochrone-API → Insert + Match
 * - LineString → (noch nicht unterstützt)
 */
export async function processUserGeometry(
  userId: number,
  geometry: any,
  params: any
): Promise<{ message: string }> {
  if (geometry.type === "Polygon") {
    await insertUserPolygon(userId, geometry);
    await matchJobsToPolygone(userId);
    return { message: "Polygon gespeichert und Jobs gematcht" };
  }

  if (geometry.type === "Point") {
    const [lon, lat] = geometry.coordinates;

    // Default-Parameter + überschreibbar durch Body
    const {
      cutoff = 900,
      mode = "WALK",
      speed = 1.4,
      date = "2025-04-14",
      time = "10:00:00",
      label = "Benutzer-Isochrone",
    } = params;

    const result = await fetchOtpApi({
      corDict: {
        userPoint: [{ coord: [lat, lon] }],
      },
      url: "http://localhost:8080/otp/routers/default/isochrone",
      precision: 10,
      cutoff,
      mode,
      speed,
      date,
      time,
    });

    const feature = result.results["userPoint"]?.[0]?.features?.[0];

    if (!feature) {
      throw new Error("Isochrone konnte nicht ermittelt werden");
    }

    await insertUserIsochrone({
      userId,
      label,
      cutoff,
      mode,
      center: [lon, lat],
      geojsonPolygon: feature,
    });

    await matchJobsToPolygone(userId);

    return {
      message: "Punkt verarbeitet → Isochrone gespeichert und Jobs gematcht",
    };
  }

  if (geometry.type === "LineString") {
    throw new Error("LineString-Verarbeitung noch nicht implementiert 🚧");
  }

  throw new Error("Unbekannter Geometrietyp");
}
