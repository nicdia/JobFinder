// src/services/geomS_coordUtils.ts
export type CoordArr = [number, number]; // irgendeine Reihenfolge
export type CoordObj = { lon: number; lat: number };

export const toLatLon = (coord: CoordArr | CoordObj): [number, number] => {
  // Objekt → immer eindeutig
  if (!Array.isArray(coord)) return [coord.lat, coord.lon];

  // Array: Heuristik → Deutschland‐BBox (47–55 N, 5–15 E)
  const [a, b] = coord;
  const looksLikeLonLat = a >= 5 && a <= 15 && b >= 47 && b <= 55; // [lon, lat]

  return looksLikeLonLat ? [b, a] : [a, b]; // → [lat, lon]
};
