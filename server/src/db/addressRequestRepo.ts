import pool from "../utils/db";

/**
 * Speichert einen Suchauftrag für den User in der Datenbank
 */
export async function insertAddressSearchRequest(
  userId: number,
  data: any
): Promise<number> {
  const query = `
  INSERT INTO account.user_search_requests (
    req_name,
    user_id,
    job_type,
    cutoff_seconds,
    speed,
    address_display,
    address_lat,
    address_lon,
    house_number,
    transport_mode
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
  )
  RETURNING id;
`;

  const values = [
    data.reqName,
    userId,
    data.jobType,
    data.cutoff, // ➜ muss in Sekunden vorliegen!
    data.speed,
    data.address?.display,
    data.address?.coords?.lat,
    data.address?.coords?.lon,
    data.houseNumber,
    data.transport,
  ];

  const res = await pool.query(query, values);
  return res.rows[0].id; // <-- liefert addressReqId
}

/**
 * Liefert alle Isochrone-Startpunkte (source_point) für einen User,
 * aber **nur** die, deren Fläche gemergt wurde
 * (label enthält '(Merged)').
 */
export async function queryAddressRequest(userId: number) {
  const sql = `
    SELECT
      r.id                                       AS id,
      'Feature'                                  AS type,
      ST_AsGeoJSON(
        ST_SetSRID(ST_MakePoint(r.address_lon, r.address_lat), 4326)
      )::json                                     AS geometry,
      jsonb_build_object(
        'req_name',        r.req_name,
        'job_type',        r.job_type,
        'cutoff',          r.cutoff_seconds,
        'speed',           r.speed,
        'address_display', r.address_display,
        'house_number',    r.house_number,
        'transport_mode',  r.transport_mode,
        'created_at',      r.created_at
      ) AS properties
    FROM account.user_search_requests r
    WHERE r.user_id = $1
      AND r.address_lat IS NOT NULL
      AND r.address_lon IS NOT NULL
  `;
  const result = await pool.query(sql, [userId]);
  return result.rows;
}
