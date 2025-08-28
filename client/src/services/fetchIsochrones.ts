// src/services/fetchUserIsochrones.ts
import { api } from "../utils/api";

type UserLite = { id?: number; token?: string };

export const fetchUserIsochrones = async (user?: UserLite) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const id = user?.id ?? storedUser?.id;
  const token = user?.token ?? localStorage.getItem("token");

  console.log("[fetchUserIsochrones] id:", id, "token:", token?.slice(0, 8));

  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");

  if (user?.token) localStorage.setItem("token", user.token);

  const path = `/userIsochrones/${id}`;
  console.log("[fetchUserIsochrones] GET", path);

  const data = await api.get<any>(path);
  console.log("[fetchUserIsochrones] Loaded isochrones:", data);

  return data;
};
