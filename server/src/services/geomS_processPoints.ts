// src/services/geomS_processPoints.ts

import { fetchOtpApi } from "./geomS_fetchOTPServer";
import { insertUserIsochrone } from "./geomS_insertIsochrone";
import { matchJobsToPolygone } from "./geomS_matchJobsToIsochrone";
import { mergeIsochrones } from "./geomS_mergeIsochrones";
import { toLatLon, CoordArr } from "./geomS_coordUtils";
import { ProcessPointsParams } from "../types/serverTypes";

export const processPoints = async ({
  userId,
  coordinates,
  params,
}: ProcessPointsParams): Promise<{
  message: string;
  points?: [number, number][];
}> => {
  const {
    cutoff = 900,
    mode = "WALK",
    speed = 1.4,
    date = "2025-04-14",
    time = "10:00:00",
    label = "Benutzer-Isochrone",
    drawnReqId = null, // ⚠️ kommt von außen
    addressReqId = null,
  } = params;

  // Array zum Speichern der Isochronen-Geometrien
  const isochrones = [];

  // Für jeden Punkt wird eine Isochrone berechnet und gespeichert
  for (const raw of coordinates) {
    const coord = toLatLon(raw);
    const result = await fetchOtpApi({
      corDict: { userPoints: [{ coord }] },
      url: "http://localhost:8080/otp/routers/current/isochrone",
      precision: 10,
      cutoff,
      mode,
      speed,
      date,
      time,
    });

    const feature = result.results["userPoints"]?.[0]?.features?.[0];

    if (!feature) {
      throw new Error(
        `Isochrone konnte nicht ermittelt werden für Punkt ${coord}`
      );
    }

    // Die Geometrie der Isochrone in das Array aufnehmen
    isochrones.push(feature.geometry);

    // Isochrone für diesen Punkt speichern
    await insertUserIsochrone({
      userId,
      label,
      cutoff,
      mode,
      center: coord, // Der aktuelle Punkt
      geojsonPolygon: feature,
      drawnReqId, // ⚠️ mitgeben
      addressReqId,
    });

    // Matching der Jobs für den Punkt
    await matchJobsToPolygone(userId);
  }

  // Wenn wir mehr als eine Isochrone haben, diese zusammenführen
  if (isochrones.length > 1) {
    const mergedGeoJSON = await mergeIsochrones(isochrones); // Merging der Isochronen
    // Speichern der zusammengeführten Isochrone in die Datenbank
    await insertUserIsochrone({
      userId,
      label: `${label} (Merged)`,
      cutoff,
      mode,
      center: toLatLon(coordinates[0]),
      geojsonPolygon: mergedGeoJSON,
      drawnReqId, // ⚠️ mitgeben
      addressReqId,
    });
    // Matching der Jobs für die zusammengeführte Isochrone
    await matchJobsToPolygone(userId);
  }

  return {
    message: "Punkte verarbeitet → Isochronen gespeichert und Jobs gematcht",
    points: coordinates.map(toLatLon),
  };
};
