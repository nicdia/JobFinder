import pool from "../utils/db";

/**
 * Berechnet alle Jobs, die in der aktuellsten Isochrone eines Users liegen,
 * und speichert sie in account.user_visible_jobs mit vollständigen Jobdaten.
 */
export async function matchJobsToIsochrone(userId: number) {
  // 1. Aktuellste Isochrone-ID holen
  const isoResult = await pool.query(
    `
    SELECT id FROM account.user_isochrones
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `,
    [userId]
  );

  if (isoResult.rowCount === 0) {
    console.warn(`⚠️ Keine Isochrone für User ${userId} gefunden.`);
    return;
  }

  const isochroneId = isoResult.rows[0].id;

  // 2. Alte Matches löschen
  await pool.query(
    `DELETE FROM account.user_visible_jobs WHERE user_id = $1;`,
    [userId]
  );

  // 3. Neue Treffer einfügen (inkl. aller Job-Daten aus mart.jobs)
  await pool.query(
    `
    INSERT INTO account.user_visible_jobs (
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
    JOIN account.user_isochrones i ON i.id = $2
    WHERE ST_Contains(i.polygon, j.geom);
  `,
    [userId, isochroneId]
  );

  console.log(`✅ Sichtbare Jobs für User ${userId} aktualisiert.`);
}
