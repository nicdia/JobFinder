// src/services/searchRequestService.ts
import { insertUserSearchRequest } from "../db/searchRequestRepo";

export async function processUserSearchRequest(
  userId: number,
  requestData: any
) {
  // Validierung (optional: kannst du verbessern)
  if (!requestData || typeof requestData !== "object") {
    throw new Error("Ungültige Suchdaten");
  }

  // An DB weitergeben
  await insertUserSearchRequest(userId, requestData);
}
