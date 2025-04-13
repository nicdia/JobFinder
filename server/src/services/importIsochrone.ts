import pool from "../utils/db";
import { ImportIsochroneParams } from "../types/serverTypes";

export async function insertUserIsochrone({
  userId,
  label,
  cutoff,
  mode,
  center,
  geojsonPolygon,
}: ImportIsochroneParams) {
  const [lon, lat] = center;

  const geometry = JSON.stringify(
    geojsonPolygon.type === "Feature" ? geojsonPolygon.geometry : geojsonPolygon // falls nur Geometry übergeben wird
  );

  await pool.query(
    `
    INSERT INTO account.user_isochrones (
      user_id,
      label,
      cutoff_seconds,
      mode,
      center,
      polygon
    ) VALUES (
      $1, $2, $3, $4,
      ST_SetSRID(ST_Point($5, $6), 4326),
      ST_SetSRID(ST_GeomFromGeoJSON($7), 4326)
    );
  `,
    [userId, label, cutoff, mode, lon, lat, geometry]
  );

  console.log(`✅ Isochrone für User ${userId} gespeichert.`);
}
