// src/db/userManagementRepo.ts
import pool from "../utils/db";

export async function getUserDataByMail(email: string) {
  const result = await pool.query(
    "SELECT * FROM account.users WHERE email = $1",
    [email]
  );
  return result;
}

export async function createUserQuery(email: string, password: string) {
  const result = await pool.query(
    `
    INSERT INTO account.users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, created_at;
    `,
    [email, password] // <-- Klartext
  );

  return result.rows[0];
}

export async function updateUser(
  userId: number,
  updates: { email?: string; password?: string }
) {
  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (updates.email) {
    fields.push(`email = $${i++}`);
    values.push(updates.email);
  }
  if (updates.password) {
    fields.push(`password_hash = $${i++}`);
    values.push(updates.password);
  }
  if (!fields.length) return;

  values.push(userId);
  const sql = `UPDATE account.users SET ${fields.join(", ")} WHERE id = $${i}`;
  await pool.query(sql, values);

  // Optional: aktualisierten User zurückgeben
  const { rows } = await pool.query(
    `SELECT id, email, created_at FROM account.users WHERE id = $1`,
    [userId]
  );
  return rows[0];
}

export async function deleteUser(userId: number) {
  await pool.query(`DELETE FROM account.users WHERE id = $1`, [userId]);
}
