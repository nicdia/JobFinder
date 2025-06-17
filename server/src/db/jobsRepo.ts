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

export async function insertUserMatchedJobs(
  userId: number,
  polygonId: number
): Promise<void> {
  await pool.query(
    `
  INSERT INTO account.user_jobs_within_search_area (
    user_id,
    search_area_id,
    drawn_req_id,
    address_req_id,
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
    starting_date,
    search_category
  )
  SELECT
    $1                           AS user_id,
    p.id                         AS search_area_id,
    p.drawn_req_id,
    p.address_req_id,
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
    j.starting_date,
    j.search_category
  FROM mart.jobs j
  JOIN account.user_search_areas        p  ON p.id = $2
  /* ---------- genau eine der beiden Joins greift ---------- */
  LEFT JOIN account.user_drawn_search_requests    dr ON dr.id = p.drawn_req_id
  LEFT JOIN account.user_search_requests  ar ON ar.id = p.address_req_id
  WHERE ST_Contains(p.geom, j.geom)
    /* ---------- Filter: nur Jobs mit passendem Type ---------- */
    AND j.search_category = COALESCE(dr.job_type, ar.job_type);
  `,
    [userId, polygonId]
  );
}
