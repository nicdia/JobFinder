// src/services/fetchUserVisibleJobs.ts
export const fetchUserVisibleJobs = async (user?: {
  id?: number;
  token?: string;
}) => {
  const id = user?.id ?? JSON.parse(localStorage.getItem("user") || "null")?.id;
  const token = user?.token ?? localStorage.getItem("token");

  console.log("[fetchUserVisibleJobs] id:", id, "token:", token?.slice(0, 8));

  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");

  const url = `http://localhost:3001/api/userVisibleJobs/${id}`;
  console.log("[fetchUserVisibleJobs] GET", url);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(
    "[fetchUserVisibleJobs] Response status:",
    res.status,
    res.ok ? "OK" : "FAIL"
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[fetchUserVisibleJobs] Error‑body:", errorText);
    throw new Error(
      `Fehler beim Laden der sichtbaren Jobs (${res.status}): ${errorText}`
    );
  }

  const data = await res.json();
  console.log("[fetchUserVisibleJobs] Loaded jobs:", data);
  console.log(`This is data: ${data}`);
  return data; // GeoJSON FeatureCollection
};
