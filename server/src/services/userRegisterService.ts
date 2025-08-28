// src/services/userRegisterService.ts
import { getUserDataByMail, createUserQuery } from "../db/userManagementRepo";

export async function createUser(email: string, password: string) {
  const existing = await getUserDataByMail(email);
  if (existing?.rows?.length) {
    const err: any = new Error("EMAIL_TAKEN");
    err.code = "EMAIL_TAKEN";
    err.status = 409;
    throw err;
  }

  const user = await createUserQuery(email, password);

  return {
    id: user.id,
    name: "",
    email: user.email,
  };
}
