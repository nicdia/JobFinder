export const fetchJobs = async () => {
  const res = await fetch(`http://localhost:3001/api/jobs`);
  if (!res.ok) throw new Error("Fehler beim Laden der Jobs");
  return res.json();
};
