import pool from "../utils/db";

export async function queryAllJobs() {
  const result = await pool.query(`
    SELECT
      id,
      'Feature' AS type,
      ST_AsGeoJSON(geom)::json AS geometry,
      to_jsonb(j) - 'geom' AS properties
    FROM mart.jobs j
    WHERE geom IS NOT NULL;
  `);

  return result.rows;
}

export async function queryUserVisibleJobs(userId: number) {
  const result = await pool.query(
    `
    SELECT
      j.id,
      'Feature' AS type,
      ST_AsGeoJSON(j.geom)::json AS geometry,
      to_jsonb(j) - 'geom' AS properties
    FROM account.user_jobs_within_search_area ujwsa
    JOIN mart.jobs j ON ujwsa.id = j.id
    WHERE ujwsa.user_id = $1 AND j.geom IS NOT NULL;
    `,
    [userId]
  );

  return result.rows;
}
