// src/services/fetchOtpService.ts
import fetch from "node-fetch";
import { FetchOtpParams } from "../types/serverTypes";

export async function fetchOtpApi({
  corDict,
  url,
  precision,
  cutoff,
  mode,
  speed,
  date,
  time,
}: FetchOtpParams) {
  const results: Record<string, any[]> = {};
  const errorResults: Record<string, any[]> = {};

  const totalTables = Object.keys(corDict).length;
  let currentTableIndex = 0;

  console.log("🚀 Starte OTP Isochrone-Abfragen...");

  for (const table of Object.keys(corDict)) {
    currentTableIndex++;
    console.log(`📦 Tabelle ${currentTableIndex}/${totalTables}: ${table}`);

    results[table] = [];
    errorResults[table] = [];

    const coords = corDict[table];
    // src/services/fetchOtpService.ts
    let modeSpeed = "";

    if (mode.includes("WALK")) {
      modeSpeed = "walk";
    } else if (mode.includes("BICYCLE")) {
      modeSpeed = "bike";
    } else if (mode.includes("TRANSIT")) {
      modeSpeed = "walk";
    } else {
      console.warn("⚠️ Modus nicht erkannt. ModeSpeed wurde nicht gesetzt.");
      continue;
    }

    for (let i = 0; i < coords.length; i++) {
      const { coord } = coords[i];
      const [lat, lon] = coord;

      const requestUrl = `${url}?algorithm=accSampling&fromPlace=${lat},${lon}&mode=${mode}&${modeSpeed}Speed=${speed}&date=${date}&time=${time}&precisionMeters=${precision}&cutoffSec=${cutoff}`;

      console.log(`🌍 Abfrage ${i + 1}/${coords.length} → ${requestUrl}`);

      try {
        const response = await fetch(requestUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        results[table].push(json);
      } catch (err) {
        console.error(`❌ Fehler für ${coord} in ${table}: ${err}`);
        results[table].push(null);
        errorResults[table].push({ coord, error: err });
      }
    }
  }

  console.log("✅ Abfrage abgeschlossen.");
  return { results, errorResults };
}
