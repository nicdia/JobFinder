// src/services/deleteAddressRequest.ts
import { api } from "../utils/api";

type UserLite = { id?: number; token?: string };

/**
 * Löscht einen Address-Suchauftrag des Users.
 * Erwarteter Backend-Pfad (analog zu POST/GET): /userInputSearchRequest/:userId/:requestId
 */
export const deleteAddressRequest = async (
  requestId: number,
  user?: UserLite
) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const id = user?.id ?? storedUser?.id;
  const token = user?.token ?? localStorage.getItem("token");

  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");
  if (user?.token) localStorage.setItem("token", user.token);

  const path = `/userInputSearchRequest/${id}/${requestId}`;
  await api.del<void>(path);
};
