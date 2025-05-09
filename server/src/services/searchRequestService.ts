// src/services/searchRequestService.ts
import { insertUserSearchRequest } from "../db/searchRequestRepo";
import { processUserGeometry } from "./geometryService";
import { mapFrontendTransportToOtpMode } from "../utils/transportMapper";

export async function processUserSearchRequest(
  userId: number,
  requestData: any
) {
  if (!requestData || typeof requestData !== "object") {
    throw new Error("Ungültige Suchdaten");
  }

  // 1. In DB speichern
  await insertUserSearchRequest(userId, requestData);

  // 2. Geometrie aufbauen (falls Adresse vorhanden)
  const lat = requestData.address?.coords?.lat;
  const lon = requestData.address?.coords?.lon;

  if (lat && lon) {
    const geometry = {
      type: "Point",
      coordinates: [lat, lon],
      cutoffSec: "300",
    };

    const otpParams = {
      mode: mapFrontendTransportToOtpMode(requestData.transport),
      speed: requestData.speed ?? 1.4,
    };

    // 3. Geometrie an OTP übergeben → Isochrone berechnen → Polygon speichern → Jobs matchen
    await processUserGeometry(userId, geometry, otpParams);
  } else {
    console.warn("Keine gültige Adresse vorhanden, OTP wird nicht ausgeführt.");
  }
}
