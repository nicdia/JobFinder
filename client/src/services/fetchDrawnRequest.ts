// src/services/fetchDrawnRequests.ts
export const fetchDrawnRequests = async (user?: {
  id?: number;
  token?: string;
}) => {
  // 1) User- und Token-Infos holen (aus Param oder localStorage)
  const id = user?.id ?? JSON.parse(localStorage.getItem("user") || "null")?.id;
  const token = user?.token ?? localStorage.getItem("token");

  console.log("[fetchDrawnRequests] id:", id, "token:", token?.slice(0, 8));

  if (!id || !token) throw new Error("Benutzerdaten fehlen oder ungültig");

  // 2) URL zusammenbauen
  const url = `http://localhost:3001/api/drawRequest/${id}`;
  console.log("[fetchDrawnRequests] GET", url);

  // 3) Request absenden (Bearer-Auth)
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(
    "[fetchDrawnRequests] Response status:",
    res.status,
    res.ok ? "OK" : "FAIL"
  );

  // 4) Fehler auffangen
  if (!res.ok) {
    const errorText = await res.text();
    console.error("[fetchDrawnRequests] Error-body:", errorText);
    throw new Error(
      `Fehler beim Laden der Draw-Requests (${res.status}): ${errorText}`
    );
  }

  // 5) GeoJSON-FeatureCollection zurückgeben
  const data = await res.json();
  console.log("[fetchDrawnRequests] Loaded drawn requests:", data);
  return data; // { type: "FeatureCollection", features: [...] }
};
