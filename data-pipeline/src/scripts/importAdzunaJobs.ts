// src/scripts/importAdzunaJobs.ts
import { fetchAdzunaJobs } from "../modules/adzunaFetcher";
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

    // → hier liegt der Typ jetzt eindeutig als Array von Tupeln vor
    const searchPairs = config.searchParamsInApis as [string, string][];

    for (const [keyword, city] of searchPairs) {
      console.log(`🔍 Hole Jobs für "${keyword}" in ${city} …`);
      const jobs = await fetchAdzunaJobs(keyword, city);
      console.log(`   → ${jobs.length} Treffer`);
      allJobs.push(...jobs);
    }

    console.log(`\n📦 ${allJobs.length} Jobs insgesamt – speichere in DB …`);
    await storeJobsToDatabase(allJobs);
    console.log("✅ Adzuna-Import abgeschlossen!");
  } catch (err) {
    console.error("❌ Import Adzuna fehlgeschlagen:", err);
    process.exit(1);
  } finally {
    await pool.end(); // DB-Pool sauber schließen
  }
}

/* ------------------------------------------------------------------ */

async function storeJobsToDatabase(jobs: any[]) {
  for (const job of jobs) {
    const externalId = job.refnr || null; // falls Adzuna 'id' benutzt, ggf. anpassen

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
}

/* ------------------------------------------------------------------ */

main();
