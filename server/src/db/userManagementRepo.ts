import pool from "../utils/db";

export async function getUserDataByMail(email: string) {
  const result = await pool.query(
    "SELECT * FROM account.users WHERE email = $1",
    [email]
  );
  return result;
}

export async function createUserQuery(email: string, passwordHash: string) {
  const result = await pool.query(
    `
    INSERT INTO account.users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, created_at;
    `,
    [email, passwordHash]
  );

  return result.rows[0];
}
