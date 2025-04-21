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

// Update user (z.B. nur Email oder Passwort)
export async function updateUser(
  userId: number,
  updates: { email?: string; password?: string }
) {
  const fields = [];
  const values: any[] = [];
  let index = 1;

  if (updates.email) {
    fields.push(`email = $${index++}`);
    values.push(updates.email);
  }

  if (updates.password) {
    fields.push(`password = crypt($${index++}, gen_salt('bf'))`);
    values.push(updates.password);
  }

  if (fields.length === 0) return;

  values.push(userId);

  const query = `
    UPDATE account.users
    SET ${fields.join(", ")}
    WHERE id = $${index}
  `;

  await pool.query(query, values);
}

export async function deleteUser(userId: number) {
  await pool.query(`DELETE FROM account.users WHERE id = $1`, [userId]);
}
