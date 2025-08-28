// src/services/userLoginService.ts
import jwt from "jsonwebtoken";
import { getUserDataByMail } from "../db/userManagementRepo";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export async function handleLogin(
  email: string,
  password: string
): Promise<{ id: number; name: string; token: string }> {
  const result = await getUserDataByMail(email);

  if (result.rowCount === 0) {
    throw new Error("invalid_credentials");
  }

  const user = result.rows[0];

  if (user.password_hash !== password) {
    throw new Error("invalid_credentials");
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "2h",
  });

  return {
    id: user.id,
    name: user.name ?? "",
    token,
  };
}
