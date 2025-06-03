// src/scripts/importBAJobs.ts
import { fetchJobsFromBA } from "../modules/baFetcher";
import { loadPipelineConfig } from "../util/loadConfig";
import pool from "../util/db";

const config = loadPipelineConfig();

/**
 * Lädt zu jedem [keyword, city]-Paar aus der Config die Jobs
 * und schreibt sie in die Staging-Tabelle.
 */
async function main() {
  try {
    const allJobs: any[] = [];

    const searchPairs = config.searchParamsInApis as [string, string][];

    for (const [keyword, city] of searchPairs) {
      console.log(`🔍 Hole BA-Jobs für "${keyword}" in ${city} …`);
      const jobs = await fetchJobsFromBA(keyword, city);
      console.log(`   → ${jobs.length} Treffer`);
      allJobs.push(...jobs);
    }

    console.log(`\n📦 ${allJobs.length} Jobs insgesamt – speichere in DB …`);
    await storeJobsToDatabase(allJobs);
    console.log("✅ BA-Import abgeschlossen!");
  } catch (err) {
    console.error("❌ Import BA fehlgeschlagen:", err);
    process.exit(1);
  } finally {
    await pool.end(); // DB-Pool sauber schließen
  }
}

/* ------------------------------------------------------------------ */

async function storeJobsToDatabase(jobs: any[]) {
  for (const job of jobs) {
    const externalId = job.refnr || null; // BA-eindeutige Kennung

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
}

/* ------------------------------------------------------------------ */

main();
