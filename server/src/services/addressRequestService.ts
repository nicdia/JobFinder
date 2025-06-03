// src/services/searchRequestService.ts
import { insertAddressSearchRequest } from "../db/addressRequestRepo";
import { processRequestDrawnGeometry } from "./DrawnRequestGeometryService";
import { mapFrontendTransportToOtpMode } from "../utils/transportMapper";

export async function processAddressSearchRequest(
  userId: number,
  requestData: any
) {
  if (!requestData || typeof requestData !== "object") {
    throw new Error("Ungültige Suchdaten");
  }

  const addressReqId = await insertAddressSearchRequest(userId, requestData);

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
    cutoff:
      (typeof requestData.cutoff === "string"
        ? parseFloat(requestData.cutoff)
        : requestData.cutoff) * 60,
    addressReqId,
    reqName: requestData.reqName,
  };
  await processRequestDrawnGeometry(userId, geometry, otpParams);
}
