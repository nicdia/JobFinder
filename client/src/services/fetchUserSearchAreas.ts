// src/services/fetchUserSearchAreas.ts
export const fetchUserSearchAreas = async (user?: {
  id?: number;
  token?: string;
}) => {
  const id = user?.id ?? JSON.parse(localStorage.getItem("user") || "null")?.id;
  const token = user?.token ?? localStorage.getItem("token");

  console.log("[fetchUserSearchAreas] id:", id, "token:", token?.slice(0, 8));

  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");

  const url = `http://localhost:3001/api/userInputSearchRequest/${id}`;
  console.log("[fetchUserSearchAreas] GET", url);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(
    "[fetchUserSearchAreas] Response status:",
    res.status,
    res.ok ? "OK" : "FAIL"
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[fetchUserSearchAreas] Error‑body:", errorText);
    throw new Error(
      `Fehler beim Laden der Suchgebiete (${res.status}): ${errorText}`
    );
  }

  const data = await res.json();
  console.log("[fetchUserSearchAreas] Loaded areas:", data);
  return data; // GeoJSON FeatureCollection
};
