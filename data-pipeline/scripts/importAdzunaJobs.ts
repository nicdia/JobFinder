import { fetchAdzunaJobs } from "../services/adzunaFetcher";
import pool from "../db";

async function mainGetDataFromAdzunaAPI() {
  try {
    const jobs = await fetchAdzunaJobs("entwickler", "Hamburg");

    console.log(`✅ ${jobs.length} Jobs erhalten.`);

    await storeJobsToDatabase(jobs);
  } catch (err) {
    console.error("❌ Fehler beim Abrufen:", err);
  }
}

async function storeJobsToDatabase(jobs: any[]) {
  for (const job of jobs) {
    const externalId = job.refnr || null;

    try {
      await pool.query(
        `INSERT INTO stage.raw_jobs_adzuna_api (source, raw_data, external_id)
         VALUES ($1, $2, $3)`,
        ["Adzuna", job, externalId]
      );
    } catch (err) {
      console.error(
        `❌ Fehler beim Speichern von Job ${externalId || "unknown"}:`,
        err
      );
    }
  }

  console.log("✅ Alle Jobs gespeichert.");
}

mainGetDataFromAdzunaAPI();
