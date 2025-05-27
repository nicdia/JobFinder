// src/services/fetchUserIsochrones.ts
export const fetchUserIsochrones = async (user?: {
  id?: number;
  token?: string;
}) => {
  /* 1) User- und Token-Infos besorgen ------------------------ */
  const id = user?.id ?? JSON.parse(localStorage.getItem("user") || "null")?.id;
  const token = user?.token ?? localStorage.getItem("token");

  console.log("[fetchUserIsochrones] id:", id, "token:", token?.slice(0, 8));

  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");

  /* 2) Ziel-URL ---------------------------------------------- */
  const url = `http://localhost:3001/api/userIsochrones/${id}`;
  console.log("[fetchUserIsochrones] GET", url);

  /* 3) Anfrage abschicken ------------------------------------ */
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(
    "[fetchUserIsochrones] Response status:",
    res.status,
    res.ok ? "OK" : "FAIL"
  );

  /* 4) Fehlerbehandlung -------------------------------------- */
  if (!res.ok) {
    const errorText = await res.text();
    console.error("[fetchUserIsochrones] Error-body:", errorText);
    throw new Error(
      `Fehler beim Laden der Isochronen (${res.status}): ${errorText}`
    );
  }

  /* 5) GeoJSON-FeatureCollection zurückgeben ----------------- */
  const data = await res.json();
  console.log("[fetchUserIsochrones] Loaded isochrones:", data);
  return data; // { type: "FeatureCollection", features: [...] }
};
