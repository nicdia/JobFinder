// mainPipeScript.ts

import { exec } from "child_process";
import { promisify } from "util";
import { readFileSync } from "fs";
import pool from "./util/db";

const execAsync = promisify(exec);

async function runSqlFile(filePath: string) {
  const sql = readFileSync(filePath, "utf-8");
  console.log(`📄 SQL ausführen: ${filePath}`);
  await pool.query(sql);
  console.log(`✅ SQL abgeschlossen: ${filePath}`);
}

async function runScript(label: string, scriptPath: string) {
  console.log(`▶️ Starte Script: ${label}`);

  // Kindprozess starten, warten bis fertig
  const { stdout, stderr } = await execAsync(`ts-node ${scriptPath}`);

  // ──> Ausgaben durchreichen
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  console.log(`✅ Script beendet: ${label}`);
}

async function main() {
  try {
    console.log("🚀 Pipeline gestartet...");

    /* 1 */ await runSqlFile("src/sql/empty_stage.sql");

    /* 2 */ await runScript("BA API Fetch", "src/scripts/importBAJobs.ts");
    await runScript("Adzuna API Fetch", "src/scripts/importAdzunaJobs.ts");

    /* 3a  🔒 Aktuellen Mart sichern ------------- */
    await runSqlFile("src/sql/insert_current_mart_into_archive.sql");

    /* 3b  🧹 Base & Mart leeren ------------------ */
    await runSqlFile("src/sql/empty_base_and_mart.sql");

    /* 4 */ await runSqlFile("src/sql/insert_into_base_ba.sql");
    await runSqlFile("src/sql/insert_into_base_adzuna.sql");

    /* 5 */ await runScript("Geocode Adzuna", "src/scripts/geocodingDoing.ts");

    /* 6 */ await runSqlFile("src/sql/insert_into_mart.sql");

    console.log("🏁 Pipeline erfolgreich abgeschlossen!");
  } catch (err) {
    console.error("❌ Fehler in der Pipeline:", err);
  }
}

main();
