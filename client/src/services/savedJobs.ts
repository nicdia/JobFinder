import { api } from "../utils/api";

type UserLite = { id?: number; token?: string };
type FeatureCollection = { type: "FeatureCollection"; features: any[] };

/** GET: gespeicherte Jobs laden */
export const fetchUserSavedJobs = async (
  user?: UserLite
): Promise<FeatureCollection> => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const id = user?.id ?? storedUser?.id;
  const token = user?.token ?? localStorage.getItem("token");

  console.log("[fetchUserSavedJobs] id:", id, "token:", token?.slice(0, 8));
  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");
  if (user?.token) localStorage.setItem("token", user.token);

  const path = `/savedJobs/${id}`;
  console.log("[fetchUserSavedJobs] GET", path);

  const data = await api.get<FeatureCollection>(path);
  return data;
};

/** POST: Job speichern */
export const saveUserJob = async (jobId: number, user?: UserLite) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const id = user?.id ?? storedUser?.id;
  const token = user?.token ?? localStorage.getItem("token");

  console.log(
    "[saveUserJob] id:",
    id,
    "jobId:",
    jobId,
    "token:",
    token?.slice(0, 8)
  );
  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");
  if (user?.token) localStorage.setItem("token", user.token);

  const path = `/savedJobs/${id}`;
  console.log("[saveUserJob] POST", path);

  const data = await api.post<{
    saved: boolean;
    alreadyExisted?: boolean;
    reason?: string;
  }>(path, { jobId });

  return data;
};

/** DELETE: Job entfernen */
export const deleteUserSavedJob = async (jobId: number, user?: UserLite) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const id = user?.id ?? storedUser?.id;
  const token = user?.token ?? localStorage.getItem("token");

  console.log(
    "[deleteUserSavedJob] id:",
    id,
    "jobId:",
    jobId,
    "token:",
    token?.slice(0, 8)
  );
  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");
  if (user?.token) localStorage.setItem("token", user.token);

  const path = `/savedJobs/${id}/${jobId}`;
  console.log("[deleteUserSavedJob] DELETE", path);

  const data = await api.del<{ deleted: boolean }>(path);
  return data;
};
