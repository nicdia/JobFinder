// irgendwo in client/src/... (wo deine auth-Funktionen liegen)
import { api } from "../utils/api";

export const loginUser = async (email: string, password: string) => {
  const data = await api.post<{ id: string; name: string; token: string }>(
    "/auth/login",
    { email, password }
  );

  localStorage.setItem("token", data.token);
  return { id: data.id, name: data.name, token: data.token };
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const data = await api.post<{ id: string; name: string; token: string }>(
    "/auth/register",
    { name, email, password }
  );

  localStorage.setItem("token", data.token);
  return { id: data.id, name: data.name, token: data.token };
};
