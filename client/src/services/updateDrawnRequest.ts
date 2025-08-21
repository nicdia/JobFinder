// src/services/updateDrawnRequest.ts
import { api } from "../utils/api";

type UserLite = { id?: number; token?: string };

/** PUT: aktualisiert eine bestehende Drawn-Request-Geometrie */
export async function updateDrawnRequest(
  user: UserLite | undefined,
  requestId: number | string,
  featureGeoJSON: any // {type:'Feature', geometry:{...}, ...}
) {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const id = user?.id ?? storedUser?.id;
  const token = user?.token ?? localStorage.getItem("token");
  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");
  if (user?.token) localStorage.setItem("token", user.token);

  const path = `/drawRequest/${id}/${requestId}`;
  // akzeptieren sowohl Feature als auch bare geometry
  const body =
    featureGeoJSON?.type === "Feature"
      ? { geometry: featureGeoJSON.geometry }
      : { geometry: featureGeoJSON };

  return api.put<any>(path, body);
}
