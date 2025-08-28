// src/scripts/importAdzunaJobs.ts
import { fetchAdzunaJobs } from "../modules/adzunaFetcher";
import { loadPipelineConfig } from "../util/loadConfig";
import pool from "../util/db";

const config = loadPipelineConfig();

/**
 * Lädt zu jedem [keyword, city]-Paar aus der Config die Jobs
 * und schreibt sie inkl. Such-Metadaten in die Staging-Tabelle.
 */
async function main() {
  try {
    const allJobs: any[] = [];

    const searchPairs = config.searchParamsInApis as [string, string][];

    for (const [keyword, city] of searchPairs) {
      console.log(`🔍 Hole Jobs für "${keyword}" in ${city} …`);
      const jobs = await fetchAdzunaJobs(keyword, city);
      console.log(`   → ${jobs.length} Treffer`);

      for (const j of jobs) {
        j.search_category = keyword;
        j.search_address_location = city;
        allJobs.push(j);
      }
    }

    console.log(`\n📦 ${allJobs.length} Jobs insgesamt – speichere in DB …`);
    await storeJobsToDatabase(allJobs);
    console.log("✅ Adzuna-Import abgeschlossen!");
  } catch (err) {
    console.error("❌ Import Adzuna fehlgeschlagen:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/* ------------------------------------------------------------------ */

async function storeJobsToDatabase(jobs: any[]) {
  const text = `
    INSERT INTO stage.raw_jobs_adzuna_api
      (source,
       raw_data,
       external_id,
       search_category,
       search_address_location)
    VALUES ($1, $2, $3, $4, $5)
  `;

  for (const job of jobs) {
    const externalId = job.id ?? null;

    try {
      await pool.query(text, [
        "Adzuna",
        job,
        externalId,
        job.search_category,
        job.search_address_location,
      ]);
    } catch (err) {
      console.error(
        `❌ Fehler beim Speichern von Job ${externalId ?? "?"}:`,
        err
      );
    }
  }
}

/* ------------------------------------------------------------------ */
main();
