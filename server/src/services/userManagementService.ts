// src/services/userManagementService.ts
import { updateUser, deleteUser } from "../db/userManagementRepo";

export async function handleUserUpdate(
  userId: number,
  updates: { email?: string; password?: string }
) {
  const user = await updateUser(userId, updates);
  return { message: "Benutzer aktualisiert", user };
}

export async function handleUserDelete(userId: number) {
  await deleteUser(userId);
  return { message: "Benutzer gelöscht" };
}
