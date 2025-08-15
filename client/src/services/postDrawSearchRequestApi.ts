// src/services/saveSearchArea.ts
import { Geometry } from "geojson";
import { api } from "../utils/api"; // ggf. Pfad anpassen

export async function saveSearchArea({
  userId,
  token,
  geometry,
  formData,
}: {
  userId: number;
  token: string;
  geometry: Geometry;
  formData: Record<string, string>;
}) {
  // Token im LocalStorage sichern, damit api.post automatisch den Header setzt
  if (token) localStorage.setItem("token", token);

  const path = `/drawRequest/${userId}`;

  return await api.post(path, {
    geometry,
    ...formData,
  });
}
