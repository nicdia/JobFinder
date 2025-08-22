// src/services/userRegisterService.ts
import { createUserQuery } from "../db/userManagementRepo";

/**
 * Registriert einen User mit *Klartext*-Passwort (landet in Spalte password_hash).
 * Nur für Prototyping geeignet!
 */
export async function createUser(email: string, password: string) {
  const user = await createUserQuery(email, password);

  return {
    id: user.id,
    name: "", // optional später
    email: user.email,
  };
}
