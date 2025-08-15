// src/services/fetchUserVisibleJobs.ts
import { api } from "../utils/api"; // Pfad ggf. anpassen

type UserLite = { id?: number; token?: string };

export const fetchUserVisibleJobs = async (user?: UserLite) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const id = user?.id ?? storedUser?.id;
  const token = user?.token ?? localStorage.getItem("token");

  console.log("[fetchUserVisibleJobs] id:", id, "token:", token?.slice(0, 8));

  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");

  // Falls Token mitgegeben wurde → im LS speichern, damit der Helper ihn nutzt
  if (user?.token) localStorage.setItem("token", user.token);

  const path = `/userVisibleJobs/${id}`;
  console.log("[fetchUserVisibleJobs] GET", path);

  const data = await api.get<any>(path); // <any> bei Bedarf durch deinen GeoJSON-Typ ersetzen

  console.log("[fetchUserVisibleJobs] Loaded jobs:", data);
  // Tipp: das hier würde sonst "[object Object]" loggen:
  // console.log("This is data:", JSON.stringify(data));
  return data; // GeoJSON FeatureCollection
};
