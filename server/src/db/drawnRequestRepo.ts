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

export async function deleteDrawnRequestCascade(
  userId: number,
  requestId: number
): Promise<{ deleted: number }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Helper: Tabellen-Existenz
    const hasTable = async (qualified: string) => {
      const { rows } = await client.query<{ exists: boolean }>(
        `SELECT to_regclass($1) IS NOT NULL AS exists;`,
        [qualified]
      );
      return rows?.[0]?.exists === true;
    };

    // 1) user_search_areas bereinigen (drawn_req_id)
    if (await hasTable("account.user_search_areas")) {
      try {
        const delAreas = await client.query(
          `DELETE FROM account.user_search_areas
           WHERE user_id = $1
             AND drawn_req_id = $2;`,
          [userId, requestId]
        );
        console.log(
          "[deleteDrawnRequestCascade] search_areas deleted:",
          delAreas.rowCount
        );
      } catch (e: any) {
        console.warn(
          "[deleteDrawnRequestCascade] search_areas cleanup failed, continuing:",
          e.message
        );
      }
    } else {
      console.log(
        "[deleteDrawnRequestCascade] table user_search_areas not present, skipping."
      );
    }

    // 2) user_jobs_within_search_area bereinigen (drawn_req_id)
    if (await hasTable("account.user_jobs_within_search_area")) {
      try {
        const delJobs = await client.query(
          `DELETE FROM account.user_jobs_within_search_area
           WHERE user_id = $1
             AND drawn_req_id = $2;`,
          [userId, requestId]
        );
        console.log(
          "[deleteDrawnRequestCascade] jobs_within_search_area deleted:",
          delJobs.rowCount
        );
      } catch (e: any) {
        console.warn(
          "[deleteDrawnRequestCascade] jobs_within_search_area cleanup failed, continuing:",
          e.message
        );
      }
    } else {
      console.log(
        "[deleteDrawnRequestCascade] table user_jobs_within_search_area not present, skipping."
      );
    }

    // 3) Primärdatensatz löschen
    const delReq = await client.query(
      `DELETE FROM account.user_drawn_search_requests
       WHERE id = $1
         AND user_id = $2;`,
      [requestId, userId]
    );
    console.log(
      "[deleteDrawnRequestCascade] drawn_request deleted:",
      delReq.rowCount
    );

    await client.query("COMMIT");
    return { deleted: delReq.rowCount ?? 0 };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[deleteDrawnRequestCascade] error:", err);
    throw err;
  } finally {
    client.release();
  }
}

export async function getDrawnRequestById(userId: number, requestId: number) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      user_id,
      req_name,
      job_type,
      transport_mode,
      cutoff_seconds,
      speed,
      geom_type,
      ST_AsGeoJSON(geom)::json AS geometry
    FROM account.user_drawn_search_requests
    WHERE user_id = $1 AND id = $2
    `,
    [userId, requestId]
  );
  return rows[0] || null;
}

/** Updatet die Geometrie (und geom_type) eines Drawn-Requests */
export async function updateDrawnRequestGeometry(
  userId: number,
  requestId: number,
  geometry: any
): Promise<number> {
  const { rowCount } = await pool.query(
    `
    UPDATE account.user_drawn_search_requests
    SET geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326),
        geom_type = $2
    WHERE id = $3 AND user_id = $4
    `,
    [JSON.stringify(geometry), geometry.type, requestId, userId]
  );
  return rowCount ?? 0;
}

/** Löscht abhängige Daten für einen Drawn-Request (Areas + Jobs) */
export async function clearDependentsForDrawn(
  userId: number,
  requestId: number
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM account.user_jobs_within_search_area
       WHERE user_id = $1 AND drawn_req_id = $2`,
      [userId, requestId]
    );
    await client.query(
      `DELETE FROM account.user_search_areas
       WHERE user_id = $1 AND drawn_req_id = $2`,
      [userId, requestId]
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
