import pool from "../utils/db";

/** Alle gespeicherten Jobs (GeoJSON Features) */
export async function queryUserSavedJobs(userId: number) {
  console.log("[queryUserSavedJobs] ↗️  userId =", userId);
  console.time("[queryUserSavedJobs] Dauer");

  const result = await pool.query(
    `
    SELECT
      s.job_id                       AS id,
      'Feature'                      AS type,
      ST_AsGeoJSON(s.geom)::json     AS geometry,
      (to_jsonb(s) - 'geom')
        || jsonb_build_object('is_saved', true) AS properties
    FROM account.user_saved_jobs s
    WHERE s.user_id = $1
      AND s.geom IS NOT NULL
    ORDER BY s.created_at DESC;
    `,
    [userId]
  );

  console.timeEnd("[queryUserSavedJobs] Dauer");
  const count = result.rowCount ?? 0;
  console.log("[queryUserSavedJobs] ↘️  gefunden:", count, "Rows");
  return result.rows;
}

/** Job speichern (Snapshot kopieren, idempotent) */
export async function saveJobForUser(userId: number, jobId: number) {
  console.log("[saveJobForUser] ↗️  userId =", userId, "jobId =", jobId);
  console.time("[saveJobForUser] Dauer");

  const result = await pool.query(
    `
    WITH src AS (
      SELECT *
      FROM account.user_jobs_within_search_area j
      WHERE j.id = $2 AND j.user_id = $1 AND j.geom IS NOT NULL
    )
    INSERT INTO account.user_saved_jobs (
      user_id, job_id, search_area_id, drawn_req_id, address_req_id,
      source, external_id, title, company, location, description, external_url,
      lat, lon, geom, published_at, starting_date, search_category
    )
    SELECT
      $1, s.id, s.search_area_id, s.drawn_req_id, s.address_req_id,
      s.source, s.external_id, s.title, s.company, s.location, s.description, s.external_url,
      s.lat, s.lon, s.geom, s.published_at, s.starting_date, s.search_category
    FROM src s
    ON CONFLICT (user_id, job_id) DO NOTHING
    RETURNING id, job_id, created_at;
    `,
    [userId, jobId]
  );

  console.timeEnd("[saveJobForUser] Dauer");

  const inserted = (result.rowCount ?? 0) === 1;
  if (inserted) {
    console.log("[saveJobForUser] ✅ gespeichert id=", result.rows[0].id);
    return { saved: true, alreadyExisted: false as const };
  }

  const exists = await pool.query(
    `SELECT 1 FROM account.user_saved_jobs WHERE user_id=$1 AND job_id=$2 LIMIT 1`,
    [userId, jobId]
  );
  const already = (exists.rowCount ?? 0) > 0;
  if (already) {
    console.log("[saveJobForUser] ℹ️  bereits vorhanden");
    return { saved: true, alreadyExisted: true as const };
  }

  console.log("[saveJobForUser] ❌ Quelle nicht gefunden/unerlaubt");
  return { saved: false, reason: "not_visible_or_missing" as const };
}

/** Gespeicherten Job entfernen */
export async function deleteSavedJob(userId: number, jobId: number) {
  console.log("[deleteSavedJob] ↗️  userId =", userId, "jobId =", jobId);
  console.time("[deleteSavedJob] Dauer");

  const result = await pool.query(
    `DELETE FROM account.user_saved_jobs WHERE user_id = $1 AND job_id = $2;`,
    [userId, jobId]
  );

  console.timeEnd("[deleteSavedJob] Dauer");
  const deleted = (result.rowCount ?? 0) > 0;
  console.log("[deleteSavedJob] 🗑️  gelöscht:", deleted ? 1 : 0);

  return { deleted };
}
