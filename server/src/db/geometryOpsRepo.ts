import pool from "../utils/db";

/**
 * Speichert ein Polygon (GeoJSON) für einen Benutzer
 */
export async function insertUserPolygon(userId: number, geometry: any) {
  const result = await pool.query(
    `
    INSERT INTO account.user_polygone_job_search_area (user_id, geom)
    VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))
    RETURNING id;
    `,
    [userId, JSON.stringify(geometry)]
  );

  return result.rows[0].id;
}

/**
 * Holt das zuletzt gespeicherte Polygon eines Nutzers
 */
export async function getLatestPolygonIdByUser(
  userId: number
): Promise<number | null> {
  const result = await pool.query(
    `
    SELECT id
    FROM account.user_polygone_job_search_area
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
    `,
    [userId]
  );

  return result.rowCount ? result.rows[0].id : null;
}

export async function insertIsochroneToDB(
  userId: number,
  label: string,
  cutoff: number,
  mode: string,
  lon: number,
  lat: number,
  geometry: string
) {
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
}

export async function insertUserMatchedJobs(
  userId: number,
  polygonId: number
): Promise<void> {
  await pool.query(
    `
    INSERT INTO account.user_jobs_within_radius (
      user_id,
      source,
      external_id,
      title,
      company,
      location,
      description,
      external_url,
      lat,
      lon,
      geom,
      published_at,
      starting_date
    )
    SELECT
      $1 AS user_id,
      j.source,
      j.external_id,
      j.title,
      j.company,
      j.location,
      j.description,
      j.external_url,
      j.lat,
      j.lon,
      j.geom,
      j.published_at,
      j.starting_date
    FROM mart.jobs j
    JOIN account.user_polygone_job_search_area p ON p.id = $2
    WHERE ST_Contains(p.geom, j.geom);
    `,
    [userId, polygonId]
  );
}

export async function deleteUserMatchedJobs(userId: number): Promise<void> {
  await pool.query(
    `DELETE FROM account.user_jobs_within_radius WHERE user_id = $1;`,
    [userId]
  );
}
