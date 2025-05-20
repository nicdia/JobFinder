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

  const addressReqId = await insertUserSearchRequest(userId, requestData);

  // 2) Geometrie vorbereiten
  const lat = requestData.address?.coords?.lat;
  const lon = requestData.address?.coords?.lon;
  if (!lat || !lon) {
    console.warn("Keine gültige Adresse – OTP wird nicht ausgeführt.");
    return;
  }

  const geometry = { type: "Point", coordinates: [lat, lon] };

  const otpParams = {
    mode: mapFrontendTransportToOtpMode(requestData.transport),
    speed: requestData.speed ?? 1.4,
    addressReqId, // ➜ an Geometry-Service durchreichen
    reqName: requestData.reqName,
  };

  await processUserGeometry(userId, geometry, otpParams);
}
