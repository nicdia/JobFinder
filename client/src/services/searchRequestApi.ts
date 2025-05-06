// services/searchRequestApi.ts
export const submitSearchRequest = async (data: any, token: string) => {
  const res = await fetch("http://localhost:3001/api/searchRequests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Fehler beim Speichern des Suchauftrags");
  return res.json();
};
