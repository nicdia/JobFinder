// src/services/submitSearchRequest.ts
import { api } from "../utils/api";

export const submitSearchRequest = async (
  data: any,
  token: string,
  userId: number
) => {
  if (token) localStorage.setItem("token", token);

  const path = `/userInputSearchRequest/${userId}`;
  const resData = await api.post<any>(path, data);

  return resData;
};
