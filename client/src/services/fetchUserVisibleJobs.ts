// src/services/fetchUserVisibleJobs.ts
import { api } from "../utils/api";

type UserLite = { id?: number; token?: string };

export const fetchUserVisibleJobs = async (user?: UserLite) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const id = user?.id ?? storedUser?.id;
  const token = user?.token ?? localStorage.getItem("token");

  console.log("[fetchUserVisibleJobs] id:", id, "token:", token?.slice(0, 8));

  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");

  if (user?.token) localStorage.setItem("token", user.token);

  const path = `/userVisibleJobs/${id}`;
  console.log("[fetchUserVisibleJobs] GET", path);

  const data = await api.get<any>(path);

  console.log("[fetchUserVisibleJobs] Loaded jobs:", data);

  return data; // GeoJSON FeatureCollection
};
