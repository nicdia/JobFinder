import pool from "../utils/db";

export async function queryUserSearchAreas(userId: number) {
  console.log("[queryUserSearchAreas] ↗️  userId =", userId);
  console.time("[queryUserSearchAreas] Dauer");

  const sql = `
    SELECT
      id,
      'Feature' AS type,
      ST_AsGeoJSON(geom)::json AS geometry,
      jsonb_build_object(
        'source_point', ST_AsGeoJSON(source_point)::json,
        'type', j.type,
        'label', j.label,
        'cutoff_seconds', j.cutoff_seconds,
        'mode', j.mode,
        'created_at', j.created_at
      ) AS properties
    FROM account.user_search_areas j
    WHERE j.user_id = $1
      AND j.geom IS NOT NULL;
  `;

  const result = await pool.query(sql, [userId]);

  console.timeEnd("[queryUserSearchAreas] Dauer");
  console.log("[queryUserSearchAreas] ↘️  gefunden:", result.rowCount, "Rows");

  return result.rows;
}
