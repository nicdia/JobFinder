import { api } from "../utils/api";

type UserLite = { id?: number; token?: string };

/**
 * Löscht einen Drawn-Suchauftrag des Users.
 * Pfad analog zu GET/POST: /drawRequest/:userId/:requestId
 */
export const deleteDrawnRequest = async (
  requestId: number,
  user?: UserLite
) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const id = user?.id ?? storedUser?.id;
  const token = user?.token ?? localStorage.getItem("token");

  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");
  if (user?.token) localStorage.setItem("token", user.token);

  const path = `/drawRequest/${id}/${requestId}`;
  await api.del<void>(path);
};
