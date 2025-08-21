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

/** … deine bestehenden insertAddressSearchRequest / queryAddressRequest hier … */

/**
 * Löscht einen Adress-Suchauftrag samt abhängigen Daten in einer Transaktion.
 * - Primärtabelle: account.user_search_requests
 * - Abhängigkeiten (optional – je nach Schema):
 *   - account.user_isochrones (wenn address_req_id vorhanden)
 *   - weitere Caches/Join-Tabellen (hier nur als Beispiel kommentiert)
 */
export async function deleteAddressRequestCascade(
  userId: number,
  requestId: number
): Promise<{ deleted: number }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // --- Helper: Tabellen-Existenz prüfen
    const hasTable = async (qualified: string) => {
      const { rows } = await client.query<{ exists: boolean }>(
        `SELECT to_regclass($1) IS NOT NULL AS exists;`,
        [qualified]
      );
      return rows?.[0]?.exists === true;
    };

    // 1) user_search_areas (abhängige Isochronen der Address-Request)
    if (await hasTable("account.user_search_areas")) {
      try {
        const delAreas = await client.query(
          `DELETE FROM account.user_search_areas
           WHERE user_id = $1
             AND address_req_id = $2;`,
          [userId, requestId]
        );
        console.log(
          "[deleteAddressRequestCascade] search_areas deleted:",
          delAreas.rowCount
        );
      } catch (e: any) {
        console.warn(
          "[deleteAddressRequestCascade] search_areas cleanup failed, continuing:",
          e.message
        );
      }
    } else {
      console.log(
        "[deleteAddressRequestCascade] table account.user_search_areas not present, skipping."
      );
    }

    // 2) user_jobs_within_search_area (Jobs, die dieser Address-Request erzeugt hat)
    if (await hasTable("account.user_jobs_within_search_area")) {
      try {
        const delJobs = await client.query(
          `DELETE FROM account.user_jobs_within_search_area
           WHERE user_id = $1
             AND address_req_id = $2;`,
          [userId, requestId]
        );
        console.log(
          "[deleteAddressRequestCascade] jobs_within_search_area deleted:",
          delJobs.rowCount
        );
      } catch (e: any) {
        console.warn(
          "[deleteAddressRequestCascade] jobs_within_search_area cleanup failed, continuing:",
          e.message
        );
      }
    } else {
      console.log(
        "[deleteAddressRequestCascade] table account.user_jobs_within_search_area not present, skipping."
      );
    }

    // 3) Primärdatensatz löschen
    const delReq = await client.query(
      `DELETE FROM account.user_search_requests
       WHERE id = $1
         AND user_id = $2;`,
      [requestId, userId]
    );
    console.log(
      "[deleteAddressRequestCascade] search_request deleted:",
      delReq.rowCount
    );

    await client.query("COMMIT");
    return { deleted: delReq.rowCount ?? 0 };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[deleteAddressRequestCascade] error:", err);
    throw err;
  } finally {
    client.release();
  }
}
