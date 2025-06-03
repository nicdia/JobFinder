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
  /* ---------- Debug ---------- */
  Object.entries(params).forEach(([k, v]) => console.log(`LOG → ${k}:`, v));

  /* ---------- Pflichtfelder ---------- */
  const {
    mode,
    speed: rawSpeed,
    cutoff,
    reqName,
    addressReqId,
    drawnReqId,
  } = params;

  if (!mode || rawSpeed === undefined || cutoff === undefined || !reqName) {
    throw new Error("Fehlende Parameter: mode, speed, cutoff oder reqName");
  }

  /* ---------- speed in Zahl wandeln ---------- */
  const speed = typeof rawSpeed === "string" ? parseFloat(rawSpeed) : rawSpeed;
  if (isNaN(speed)) throw new Error(`Ungültige Geschwindigkeit: ${rawSpeed}`);

  /* ---------- aktuelles Datum & Zeit ---------- */
  const time = "14:00:00";
  const date = "2024-12-12";
  const label = reqName;

  /* ---------- Isochronen erzeugen ---------- */
  const isochrones: any[] = [];

  for (const raw of coordinates) {
    const coord = toLatLon(raw);

    const result = await fetchOtpApi({
      corDict: { userPoints: [{ coord }] },
      url: "http://localhost:8080/otp/routers/current/isochrone",
      precision: 10,
      cutoff,
      mode, // ← direkt weitergereicht
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

  /* ---------- ggf. Isochronen mergen ---------- */
  if (isochrones.length > 1) {
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
