export const fetchUserVisibleJobs = async () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) throw new Error("Nicht eingeloggt");

  const user = JSON.parse(userStr);
  const res = await fetch(
    `http://localhost:3001/api/userVisibleJobs/${user.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Fehler beim Laden der sichtbaren Jobs");
  return await res.json();
};
