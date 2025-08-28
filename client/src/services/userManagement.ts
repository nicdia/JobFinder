import { api } from "../utils/api";

type UpdatePayload = {
  email?: string;
  password?: string;
};

export const updateUserProfile = async (
  userId: number,
  payload: UpdatePayload
) => {
  const data = await api.put<{ message: string; user?: any }>(
    `/users/${userId}`,
    payload
  );

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
