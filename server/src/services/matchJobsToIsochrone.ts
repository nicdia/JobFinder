import pool from "../utils/db";

/**
 * Berechnet alle Jobs, die im aktuellsten Polygon eines Users liegen,
 * und speichert sie in account.user_visible_jobs mit vollständigen Jobdaten.
 */
export async function matchJobsToPolygone(userId: number) {
  // 1. Aktuellstes Polygon des Users holen
  const polyResult = await pool.query(
    `
    SELECT id FROM account.user_polygone_job_search_area
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
    `,
    [userId]
  );

  if (polyResult.rowCount === 0) {
    console.warn(`⚠️ Kein Polygon für User ${userId} gefunden.`);
    return;
  }

  const polygonId = polyResult.rows[0].id;

  // 2. Alte Matches löschen
  await pool.query(
    `DELETE FROM account.user_jobs_within_radius  WHERE user_id = $1;`,
    [userId]
  );

  // 3. Neue Treffer anhand Polygon einfügen
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

  console.log(
    `✅ Sichtbare Jobs für User ${userId} basierend auf Polygon aktualisiert.`
  );
}
