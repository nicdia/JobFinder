import pool from "../utils/db";

/**
 in case user drew a polygon, the polyon counts as isochrone and is inserted directly into the isochrone table
 */
export async function insertUserDrawnPolygon(
  userId: number,
  geometry: any,
  drawnReqId: number // 💡 neu
): Promise<number> {
  const result = await pool.query(
    `
    INSERT INTO account.user_search_areas (
      user_id,
      geom,
      type,
      drawn_req_id,
      address_req_id
    )
    VALUES (
      $1,
      ST_SetSRID(ST_GeomFromGeoJSON($2),4326),
      'direct',
      $3,        -- drawn_req_id
      NULL       -- address_req_id
    )
    RETURNING id;
    `,
    [userId, JSON.stringify(geometry), drawnReqId]
  );
  return result.rows[0].id;
}

/**
 * Speichert ein vom Nutzer gezeichnetes Feature (Point, LineString, Polygon)
 * in account.user_drawn_search_requests und gibt die neue ID zurück.
 */
// src/db/geometryOpsRepo.ts
// db/drawnRequestRepo.ts (oder ähnlich)
export async function insertUserDrawnRequest(
  userId: number,
  geometry: any,
  reqName: string,
  jobType: string,
  transport: string,
  cutoff: string,
  speed: string
): Promise<number> {
  const sql = `
  INSERT INTO account.user_drawn_search_requests (
    req_name,
    user_id,
    job_type,
    transport_mode,
    cutoff_seconds,
    speed,
    geom,
    geom_type
  )
  VALUES (
    $1, $2, $3, $4, $5, $6, ST_SetSRID(ST_GeomFromGeoJSON($7), 4326), $8
  )
  RETURNING id;
`;

  const vals = [
    reqName,
    userId,
    jobType,
    transport,
    cutoff,
    speed,
    JSON.stringify(geometry),
    geometry.type,
  ];

  const { rows } = await pool.query(sql, vals);
  return rows[0].id;
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
    FROM account.user_search_areas
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
    `,
    [userId]
  );

  return result.rowCount ? result.rows[0].id : null;
}

export async function unionOpsPolygon(geoJSON: any): Promise<string> {
  const result = await pool.query(
    `
    SELECT ST_AsGeoJSON(
             ST_UnaryUnion(
               ST_Collect(sub.geometries)
             )
           ) AS merged
    FROM (
      SELECT ST_Buffer(
               ST_GeomFromGeoJSON(value), 0
             ) AS geometries
      FROM json_array_elements(($1::json)->'geometries') AS g(value)
    ) sub;
    `,
    [JSON.stringify(geoJSON)]
  );

  return result.rows[0]?.merged;
}

export async function queryDrawnRequest(userId: number) {
  const result = await pool.query(
    `
    SELECT
      id,
      'Feature'                              AS type,
      ST_AsGeoJSON(geom)::json               AS geometry,
      to_jsonb(d) - 'geom' - 'user_id' - 'id' AS properties
    FROM account.user_drawn_search_requests d
    WHERE d.user_id = $1
      AND d.geom IS NOT NULL;
    `,
    [userId]
  );

  return result.rows; // Array<Feature>
}
