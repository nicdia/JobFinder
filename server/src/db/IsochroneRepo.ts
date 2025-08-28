import pool from "../utils/db";

export async function insertIsochroneToDB(
  userId: number,
  label: string,
  cutoff: number,
  mode: string,
  lon: number,
  lat: number,
  geometry: string,
  drawnReqId: number | null,
  addressReqId: number | null
) {
  await pool.query(
    `
    INSERT INTO account.user_search_areas (
      user_id, label, cutoff_seconds, mode,
      source_point, geom, type,
      drawn_req_id, address_req_id
    )
    VALUES (
      $1, $2, $3, $4,
      ST_SetSRID(ST_Point($5,$6),4326),
      ST_SetSRID(ST_GeomFromGeoJSON($7),4326),
      'isochrone',
      $8,  -- drawn_req_id  (nullable)
      $9   -- address_req_id (nullable)
    );
    `,
    [userId, label, cutoff, mode, lon, lat, geometry, drawnReqId, addressReqId]
  );
}

export async function queryUserIsochrone(userId: number) {
  console.log("[queryUserIsochrone] ↗️  userId =", userId);
  console.time("[queryUserIsochrone] Dauer");

  const sql = `
    SELECT
      id,
      'Feature' AS type,
      ST_AsGeoJSON(geom)::json AS geometry,
      jsonb_build_object(
        'source_point',   ST_AsGeoJSON(source_point)::json,
        'type',           j.type,
        'label',          j.label,
        'cutoff_seconds', j.cutoff_seconds,
        'mode',           j.mode,
        'created_at',     j.created_at,
        'drawn_req_id',   j.drawn_req_id,
        'address_req_id', j.address_req_id
      ) AS properties
    FROM account.user_search_areas j
    WHERE j.user_id = $1
      AND j.geom IS NOT NULL;
  `;

  const result = await pool.query(sql, [userId]);

  console.timeEnd("[queryUserIsochrone] Dauer");
  console.log("[queryUserIsochrone] ↘️  gefunden:", result.rowCount, "Rows");

  return result.rows; // Array<Feature>
}
