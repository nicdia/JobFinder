// src/services/fetchUserSearchRequests.ts
import { api } from "../utils/api";

type UserLite = { id?: number; token?: string };

// optional: wenn du ein Rückgabe-Typ kennst, hier eintragen
// type SearchRequests = GeoJSON.FeatureCollection | any;

export const fetchUserSearchRequests = async (user?: UserLite) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const id = user?.id ?? storedUser?.id;
  const token = user?.token ?? localStorage.getItem("token");

  console.log(
    "[fetchUserSearchRequests] id:",
    id,
    "token:",
    token?.slice(0, 8)
  );

  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");

  if (user?.token) localStorage.setItem("token", user.token);

  const path = `/userInputSearchRequest/${id}`;
  console.log("[fetchUserSearchRequests] GET", path);

  const data = await api.get<any>(path);

  console.log("[fetchUserSearchRequests] Loaded requests:", data);
  return data;
};
