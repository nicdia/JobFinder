import pool from "../utils/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserDataByMail } from "../db/userManagementRepo";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export async function handleLogin(
  email: string,
  password: string
): Promise<string> {
  const result = await getUserDataByMail(email);

  if (result.rowCount === 0) {
    throw new Error("invalid_credentials");
  }

  const user = result.rows[0];
  const passwordValid = await bcrypt.compare(password, user.password_hash);

  if (!passwordValid) {
    throw new Error("invalid_credentials");
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "2h",
  });

  return token;
}
