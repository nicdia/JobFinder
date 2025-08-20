// src/services/geomS_processPoints.ts
import { fetchOtpApi } from "./geomS_fetchOTPServer";
import { insertUserIsochrone } from "./geomS_insertIsochrone";
import { matchJobsToPolygone } from "./geomS_matchJobsToIsochrone";
import { mergeIsochrones } from "./geomS_mergeIsochrones";
import { toLatLon } from "./geomS_coordUtils";
import { ProcessPointsParams } from "../types/serverTypes";

export const processPoints = async ({
  userId,
  coordinates,
  params,
}: ProcessPointsParams): Promise<{
  message: string;
  points?: [number, number][];
}> => {
  /* ---------- Pflichtfelder ---------- */
  const {
    mode,
    speed: rawSpeed,
    cutoff,
    reqName,
    addressReqId,
    drawnReqId,
    saveOnlyMerged = false,
  } = params;

  if (!mode || rawSpeed === undefined || cutoff === undefined || !reqName) {
    throw new Error("Fehlende Parameter: mode, speed, cutoff oder reqName");
  }

  /* ---------- speed in Zahl wandeln ---------- */
  const speed = typeof rawSpeed === "string" ? parseFloat(rawSpeed) : rawSpeed;
  if (isNaN(speed)) throw new Error(`Ungültige Geschwindigkeit: ${rawSpeed}`);

  /* ---------- Isochronen erzeugen ---------- */
  const isochrones: any[] = [];
  const time = "14:00:00";
  const date = "2024-12-12";
  const label = reqName;
  const BASE = process.env.OTP_BASE_URL ?? "http://localhost:8080";

  // Präfix ohne trailing slash:
  const PREF = (process.env.OTP_PATH_PREFIX ?? "/otp").replace(/\/$/, "");

  // Router-ID (häufig: "default"; manche Setups: "current")
  const RID = process.env.OTP_ROUTER_ID ?? "current";

  // Finaler Endpunkt:
  const url = `${BASE}${PREF}/routers/${RID}/isochrone`;
  for (const raw of coordinates) {
    const coord = toLatLon(raw);

    const result = await fetchOtpApi({
      corDict: { userPoints: [{ coord }] },
      url: url,
      precision: 10,
      cutoff,
      mode,
      speed,
      date,
      time,
    });

    const feature = result.results["userPoints"]?.[0]?.features?.[0];
    if (!feature)
      throw new Error(
        `Isochrone konnte nicht ermittelt werden für Punkt ${coord}`
      );

    isochrones.push(feature.geometry);

    /* Zwischen-Isochrone nur speichern, wenn NICHT saveOnlyMerged */
    if (!saveOnlyMerged) {
      await insertUserIsochrone({
        userId,
        label,
        cutoff,
        mode,
        center: coord,
        geojsonPolygon: feature,
        drawnReqId,
        addressReqId,
      });
      await matchJobsToPolygone(userId);
    }
  } // ← for-Schleife ENDE  ✅

  /* ---------- finales Speichern ---------- */
  if (isochrones.length === 1) {
    if (saveOnlyMerged) {
      // Nur ein Polygon + bislang nichts gespeichert
      await insertUserIsochrone({
        userId,
        label,
        cutoff,
        mode,
        center: toLatLon(coordinates[0]),
        geojsonPolygon: {
          type: "Polygon",
          coordinates: isochrones[0].coordinates,
        },
        drawnReqId,
        addressReqId,
      });
      await matchJobsToPolygone(userId);
    }
  } else {
    // mehrere → mergen und nur das Merge speichern
    const mergedGeoJSON = await mergeIsochrones(isochrones);

    await insertUserIsochrone({
      userId,
      label: `${label} (Merged)`,
      cutoff,
      mode,
      center: toLatLon(coordinates[0]),
      geojsonPolygon: mergedGeoJSON,
      drawnReqId,
      addressReqId,
    });
    await matchJobsToPolygone(userId);
  }

  return {
    message: "Punkte verarbeitet → Isochronen gespeichert und Jobs gematcht",
    points: coordinates.map(toLatLon),
  };
};
