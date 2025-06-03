// src/services/saveSearchArea.ts
import { Geometry } from "geojson";

export async function saveSearchArea({
  userId,
  token,
  geometry,
  formData,
}: {
  userId: number;
  token: string;
  geometry: Geometry;
  formData: Record<string, string>;
}) {
  const response = await fetch(
    `http://localhost:3001/api/drawRequest/${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        geometry,
        ...formData,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Speichern der Geometrie fehlgeschlagen (${response.status}): ${errorText}`
    );
  }

  return await response.json();
}
