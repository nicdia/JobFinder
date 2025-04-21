import { updateUser, deleteUser } from "../db/userManagementRepo";

export async function handleUserUpdate(
  userId: number,
  updates: { email?: string; password?: string }
) {
  await updateUser(userId, updates);
  return { message: "Benutzer aktualisiert" };
}

export async function handleUserDelete(userId: number) {
  await deleteUser(userId);
  return { message: "Benutzer gelöscht" };
}
