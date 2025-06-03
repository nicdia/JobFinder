import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export async function fetchAdzunaJobs(query: string, location: string) {
  const app_id = process.env.ADZUNA_APP_ID;
  const app_key = process.env.ADZUNA_APP_KEY;

  if (!app_id || !app_key) {
    throw new Error("Adzuna API credentials fehlen in .env");
  }

  const url =
    `https://api.adzuna.com/v1/api/jobs/de/search/1?app_id=${app_id}` +
    `&app_key=${app_key}&results_per_page=20&what=${encodeURIComponent(
      query
    )}` +
    `&where=${encodeURIComponent(location)}`;

  console.log(`🔉 [Adzuna] Request  →  ${url}`);

  const res = await fetch(url);
  console.log(`🔉 [Adzuna] Response ←  ${res.status} ${res.statusText}`);

  if (!res.ok) {
    throw new Error(`Fehler beim Abrufen von Adzuna: ${res.status}`);
  }

  const data: any = await res.json();
  console.log(`🔉 [Adzuna] Treffer   ←  ${data.results.length}`);

  return data.results;
}
