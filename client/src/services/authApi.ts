// src/services/auth.ts  (oder wo deine Auth-Services liegen)
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
  _name: string, // wird aktuell nicht benötigt
  email: string,
  password: string
) => {
  const data = await api.post<{ id: string; name: string; token: string }>(
    "/auth/register",
    { email, password } // ⬅️ nur email + password
  );
  localStorage.setItem("token", data.token);
  localStorage.setItem(
    "user",
    JSON.stringify({ id: data.id, name: data.name })
  );
  return { id: data.id, name: data.name, token: data.token };
};
