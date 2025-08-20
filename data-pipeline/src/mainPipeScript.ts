// src/mainPipeScript.ts
import { exec } from "child_process";
import { promisify } from "util";
import { readFileSync } from "fs";
import pool from "./util/db";

const execAsync = promisify(exec);

// Hilfsfunktion: ts-node (Dev) vs. node dist (Prod)
function resolveRunner(scriptTsPath: string) {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) return { cmd: "ts-node", file: scriptTsPath };
  // src/foo/bar.ts -> dist/foo/bar.js
  const jsPath = scriptTsPath
    .replace(/^src[\\/]/, "dist/")
    .replace(/\.ts$/, ".js");
  return { cmd: "node", file: jsPath };
}

async function runSqlFile(filePath: string) {
  const sql = readFileSync(filePath, "utf-8");
  console.log(`📄 SQL ausführen: ${filePath}`);
  await pool.query(sql);
  console.log(`✅ SQL abgeschlossen: ${filePath}`);
}

async function runScript(label: string, scriptPathTs: string) {
  console.log(`▶️ Starte Script: ${label}`);
  const { cmd, file } = resolveRunner(scriptPathTs);
  const { stdout, stderr } = await execAsync(`${cmd} ${file}`);
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  console.log(`✅ Script beendet: ${label}`);
}

async function main() {
  try {
    console.log("🚀 Pipeline gestartet...");
    await runSqlFile("src/sql/empty_stage.sql");
    await runScript("BA API Fetch", "src/scripts/importBAJobs.ts");
    await runScript("Adzuna API Fetch", "src/scripts/importAdzunaJobs.ts");
    await runSqlFile("src/sql/insert_current_mart_into_archive.sql");
    await runSqlFile("src/sql/empty_base_and_mart.sql");
    await runSqlFile("src/sql/insert_into_base_ba.sql");
    await runSqlFile("src/sql/insert_into_base_adzuna.sql");
    await runScript("Geocode Adzuna", "src/scripts/geocodingDoing.ts");
    await runSqlFile("src/sql/insert_into_mart.sql");
    console.log("🏁 Pipeline erfolgreich abgeschlossen!");
  } catch (err) {
    console.error("❌ Fehler in der Pipeline:", err);
    process.exitCode = 1;
  } finally {
    await pool.end?.();
  }
}

main();
