// src/services/lineStringToPoints.ts

export function generatePointsFromLineString(
  lineString: [number, number][],
  numPoints: number
): [number, number][] {
  const points: [number, number][] = [];

  // Berechne die Länge des LineStrings
  const totalLength = calculateLineLength(lineString);

  // Berechne den Abstand zwischen den Punkten
  const step = totalLength / (numPoints - 1);

  let currentDistance = 0;
  for (let i = 0; i < numPoints; i++) {
    const point = getPointAtDistance(lineString, currentDistance);
    points.push(point);
    currentDistance += step;
  }

  return points;
}

// Hilfsfunktion zur Berechnung der Länge des LineStrings
function calculateLineLength(lineString: [number, number][]): number {
  let length = 0;

  for (let i = 1; i < lineString.length; i++) {
    const [lon1, lat1] = lineString[i - 1];
    const [lon2, lat2] = lineString[i];

    // Berechne die Distanz zwischen benachbarten Punkten (Haversine-Formel)
    length += haversineDistance(lon1, lat1, lon2, lat2);
  }

  return length;
}

// Berechne die Entfernung zwischen zwei Punkten in Metern (Haversine-Formel)
function haversineDistance(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  const R = 6371e3; // Radius der Erde in Metern
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Berechne den Punkt auf dem LineString bei einer bestimmten Distanz
function getPointAtDistance(
  lineString: [number, number][],
  distance: number
): [number, number] {
  let currentDistance = 0;
  for (let i = 1; i < lineString.length; i++) {
    const [lon1, lat1] = lineString[i - 1];
    const [lon2, lat2] = lineString[i];

    const segmentLength = haversineDistance(lon1, lat1, lon2, lat2);

    if (currentDistance + segmentLength >= distance) {
      const fraction = (distance - currentDistance) / segmentLength;
      const lon = lon1 + (lon2 - lon1) * fraction;
      const lat = lat1 + (lat2 - lat1) * fraction;
      return [lon, lat];
    }

    currentDistance += segmentLength;
  }

  return lineString[lineString.length - 1]; // Rückgabe des letzten Punkts
}
