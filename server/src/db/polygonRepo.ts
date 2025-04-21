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
