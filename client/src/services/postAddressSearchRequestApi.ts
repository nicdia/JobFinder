// src/services/submitSearchRequest.ts
import { api } from "../utils/api"; // ggf. Pfad anpassen

export const submitSearchRequest = async (
  data: any,
  token: string,
  userId: number
) => {
  // Token speichern, damit api.post() automatisch den Authorization-Header setzt
  if (token) localStorage.setItem("token", token);

  const path = `/userInputSearchRequest/${userId}`;
  const resData = await api.post<any>(path, data); // <any> bei Bedarf typisieren

  return resData;
};
