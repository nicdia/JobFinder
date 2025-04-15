import pool from "../utils/db";
import bcrypt from "bcrypt";

export async function createUser(email: string, password: string) {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

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
