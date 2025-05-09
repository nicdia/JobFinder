import pool from "../utils/db";

export async function queryAllJobs() {
  console.log("[queryAllJobs] ↗️  starte Query …");
  console.time("[queryAllJobs] Dauer");

  const result = await pool.query(`
    SELECT
      id,
      'Feature' AS type,
      ST_AsGeoJSON(geom)::json AS geometry,
      to_jsonb(j) - 'geom' AS properties
    FROM mart.jobs j
    WHERE geom IS NOT NULL;
  `);

  console.timeEnd("[queryAllJobs] Dauer");
  console.log("[queryAllJobs] ↘️  gefunden:", result.rowCount, "Rows");
  return result.rows;
}

export async function queryUserVisibleJobs(userId: number) {
  console.log("[queryUserVisibleJobs] ↗️  userId =", userId);
  console.time("[queryUserVisibleJobs] Dauer");

  const result = await pool.query(
    `
  SELECT
    id,
    'Feature'                       AS type,
    ST_AsGeoJSON(j.geom)::json      AS geometry,
    to_jsonb(j) - 'geom'            AS properties
  FROM account.user_jobs_within_search_area j
  WHERE j.user_id = $1 AND j.geom IS NOT NULL;
  `,
    [userId]
  );

  console.timeEnd("[queryUserVisibleJobs] Dauer");
  console.log("[queryUserVisibleJobs] ↘️  gefunden:", result.rowCount, "Rows");
  return result.rows;
}
