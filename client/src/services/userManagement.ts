import { api } from "../utils/api";

type UpdatePayload = {
  email?: string;
  password?: string; // wird im Backend als Klartext in password_hash gespeichert
};

export const updateUserProfile = async (
  userId: number,
  payload: UpdatePayload
) => {
  // PATCH → PUT
  const data = await api.put<{ message: string; user?: any }>(
    `/users/${userId}`,
    payload
  );

  // Falls der Server dir den User zurückgibt und du lokal updaten willst:
  if (data?.user?.id) {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...(stored || {}),
        id: data.user.id,
        email: data.user.email,
      })
    );
  }

  return data;
};

export const deleteUserAccount = async (userId: number) => {
  const data = await api.del<{ message: string }>(`/users/${userId}`);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return data;
};
