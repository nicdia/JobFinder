import pool from "../utils/db";
import bcrypt from "bcrypt";
import { createUserQuery } from "../db/userManagementRepo";

export async function createUser(email: string, password: string) {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const result = await createUserQuery(email, passwordHash);

  return result;
}
