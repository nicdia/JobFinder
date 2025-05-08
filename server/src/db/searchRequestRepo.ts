import pool from "../utils/db";

/**
 * Speichert einen Suchauftrag für den User in der Datenbank
 */
export async function insertUserSearchRequest(userId: number, data: any) {
  const query = `
    INSERT INTO account.user_search_requests (
      user_id,
      job_type,
      commute_range,
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
    data.jobType,
    data.commuteRange,
    data.address?.display,
    data.address?.coords?.lat,
    data.address?.coords?.lon,
    data.houseNumber,
    data.transport,
  ];

  await pool.query(query, values);
}
