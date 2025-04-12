import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export async function fetchJobsFromBA(query: string, ort: string) {
  const apiKey = process.env.BA_API_KEY;

  if (!apiKey) {
    throw new Error("❌ API-Key fehlt in der .env-Datei");
  }

  const url = `https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs?angebotsart=1&was=${encodeURIComponent(
    query
  )}&wo=${encodeURIComponent(ort)}&umkreis=5`;

  const res = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`❌ Fehler beim Abrufen: ${res.status}`);
  }
  const data = (await res.json()) as any;
  return data.stellenangebote ?? [];
}
