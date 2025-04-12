import { fetchJobsFromBA } from "../modules/baFetcher";
import pool from "../util/db";

async function mainGetDataFromBAAPI() {
  try {
    const jobs = await fetchJobsFromBA("entwickler", "Hamburg");

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
        `INSERT INTO stage.raw_jobs_ba_api (source, raw_data, external_id)
         VALUES ($1, $2, $3)`,
        ["BA", job, externalId]
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

mainGetDataFromBAAPI();
