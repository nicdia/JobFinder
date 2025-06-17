// src/scripts/importBAJobs.ts
import { fetchJobsFromBA } from "../modules/baFetcher";
import { loadPipelineConfig } from "../util/loadConfig";
import pool from "../util/db";

const config = loadPipelineConfig();

/**
 * Lädt zu jedem [keyword, city]-Paar aus der Config die BA-Jobs
 * und schreibt sie inkl. Such-Metadaten in die Staging-Tabelle.
 */
async function main() {
  try {
    const allJobs: any[] = [];

    const searchPairs = config.searchParamsInApis as [string, string][];

    for (const [keyword, city] of searchPairs) {
      console.log(`🔍 Hole BA-Jobs für "${keyword}" in ${city} …`);
      const jobs = await fetchJobsFromBA(keyword, city);
      console.log(`   → ${jobs.length} Treffer`);

      // ➜ Metadaten anreichern
      for (const j of jobs) {
        j.search_category = keyword;
        j.search_address_location = city;
        allJobs.push(j);
      }
    }

    console.log(`\n📦 ${allJobs.length} Jobs insgesamt – speichere in DB …`);
    await storeJobsToDatabase(allJobs);
    console.log("✅ BA-Import abgeschlossen!");
  } catch (err) {
    console.error("❌ Import BA fehlgeschlagen:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/* ------------------------------------------------------------------ */

async function storeJobsToDatabase(jobs: any[]) {
  const text = `
    INSERT INTO stage.raw_jobs_ba_api
      (source,
       raw_data,
       external_id,
       search_category,
       search_address_location)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT DO NOTHING;   -- optional: falls UNIQUE-Index existiert
  `;

  for (const job of jobs) {
    const externalId = job.refnr ?? null; // BA-eindeutige Kennung

    try {
      await pool.query(text, [
        "BA",
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
