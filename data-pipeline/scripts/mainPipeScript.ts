import { exec } from "child_process";
import { promisify } from "util";
import { readFileSync } from "fs";
import path from "path";
import pool from "../utils/db"; // deine DB-Verbindung

const execAsync = promisify(exec);

async function runSqlFile(filePath: string) {
  const sql = readFileSync(filePath, "utf-8");
  console.log(`🟡 SQL ausführen: ${filePath}`);
  await pool.query(sql);
  console.log(`✅ SQL fertig: ${filePath}`);
}

async function runScript(label: string, scriptPath: string) {
  console.log(`🟡 Script starten: ${label}`);
  await execAsync(`ts-node ${scriptPath}`);
  console.log(`✅ Script fertig: ${label}`);
}

async function main() {
  try {
    console.log("🚀 Pipeline gestartet...");

    // 1. Daten abrufen
    await runScript("BA API Fetch", "scripts/importBaJobs.ts");
    await runScript("Adzuna API Fetch", "scripts/importAdzunaJobs.ts");

    // 2. Stage → Base Transformation
    await runSqlFile("sql/transform_ba.sql");
    await runSqlFile("sql/transform_adzuna.sql");

    // 3. Geocoding
    await runScript("Geocode Adzuna", "scripts/geocodeAdzuna.ts");

    // 4. Base → Mart
    await runSqlFile("sql/build_mart.sql");

    console.log("🏁 Pipeline erfolgreich abgeschlossen!");
  } catch (err) {
    console.error("❌ Fehler in der Pipeline:", err);
  }
}

main();
