// src/services/saveSearchArea.ts
import { Geometry } from "geojson";
import { api } from "../utils/api";

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
  if (token) localStorage.setItem("token", token);

  const path = `/drawRequest/${userId}`;

  return await api.post(path, {
    geometry,
    ...formData,
  });
}
