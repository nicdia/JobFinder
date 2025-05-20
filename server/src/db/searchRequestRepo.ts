import pool from "../utils/db";

/**
 * Speichert einen Suchauftrag für den User in der Datenbank
 */
export async function insertUserSearchRequest(userId: number, data: any) {
  const query = `
    INSERT INTO account.user_search_requests (
      req_name,
      user_id,
      job_type,
      speed,
      address_display,
      address_lat,
      address_lon,
      house_number,
      transport_mode,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
  `;

  const values = [
    userId,
    data.reqName,
    data.jobType,
    data.speed,
    data.address?.display,
    data.address?.coords?.lat,
    data.address?.coords?.lon,
    data.houseNumber,
    data.transport,
  ];

  await pool.query(query, values);
}

/**
 * Liefert alle Isochrone-Startpunkte (source_point) für einen User,
 * aber **nur** die, deren Fläche gemergt wurde
 * (label enthält '(Merged)').
 */
export async function queryIsochroneCenters(userId: number) {
  const sql = `
    SELECT
      u.id                         AS id,
      'Feature'                    AS type,
      ST_AsGeoJSON(u.source_point)::json AS geometry,
      jsonb_build_object(
        'search_area_id', u.id,
        'label', u.label,
        'cutoff_seconds', u.cutoff_seconds,
        'mode', u.mode,
        'created_at', u.created_at
      ) AS properties
    FROM account.user_search_areas u
    WHERE u.user_id = $1
      AND u.type = 'isochrone'
      AND u.label LIKE '%(Merged)%'
      AND u.source_point IS NOT NULL;
  `;
  const result = await pool.query(sql, [userId]);
  return result.rows; // Array von Point-Features
}
