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
export async function insertUserDrawnRequest(
  userId: number,
  geometry: any,
  reqName = "Zeichnung"
): Promise<number> {
  const geomType = geometry.type;

  const result = await pool.query(
    `
    INSERT INTO account.user_drawn_search_requests (
      user_id, req_name, geom_type, geom
    )
    VALUES (
      $1, $2, $3,
      ST_SetSRID(ST_GeomFromGeoJSON($4),4326)
    )
    RETURNING id;
    `,
    [userId, reqName, geomType, JSON.stringify(geometry)]
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
    SELECT ST_AsGeoJSON(ST_Union(ST_GeomFromGeoJSON($1))) AS merged
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
