// src/services/userRegisterService.ts
import { getUserDataByMail, createUserQuery } from "../db/userManagementRepo";

/**
 * Registriert einen User mit *Klartext*-Passwort (landet in Spalte password_hash).
 * Nur für Prototyping geeignet!
 */
export async function createUser(email: string, password: string) {
  // Vorab prüfen, ob E-Mail schon existiert
  const existing = await getUserDataByMail(email);
  if (existing?.rows?.length) {
    const err: any = new Error("EMAIL_TAKEN");
    err.code = "EMAIL_TAKEN";
    err.status = 409;
    throw err;
  }

  // Falls nicht vorhanden -> anlegen
  const user = await createUserQuery(email, password);

  return {
    id: user.id,
    name: "", // optional später
    email: user.email,
  };
}
