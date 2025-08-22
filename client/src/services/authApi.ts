// src/services/authApi.ts
import { api } from "../utils/api";

export const loginUser = async (email: string, password: string) => {
  const data = await api.post<{ id: string; name: string; token: string }>(
    "/auth/login",
    { email, password }
  );
  localStorage.setItem("token", data.token);
  localStorage.setItem(
    "user",
    JSON.stringify({ id: data.id, name: data.name })
  );
  return { id: data.id, name: data.name, token: data.token };
};

export const registerUser = async (
  _name: string,
  email: string,
  password: string
) => {
  try {
    const data = await api.post<{ id: string; name: string; token: string }>(
      "/auth/register",
      { email, password }
    );

    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({ id: data.id, name: data.name })
    );
    return { id: data.id, name: data.name, token: data.token };
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status;
    const msg =
      err?.data?.error ?? err?.response?.data?.error ?? err?.message ?? "";

    if (
      status === 409 ||
      /bereits registriert|exists|duplicate/i.test(String(msg))
    ) {
      const e = new Error("Diese E-Mail ist bereits registriert.");
      (e as any).code = "EMAIL_TAKEN";
      throw e;
    }
    throw err;
  }
};
