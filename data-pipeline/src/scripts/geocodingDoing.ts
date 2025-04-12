import { geocodeTable } from "../modules/geocodingFunctionality";
import { loadPipelineConfig } from "../util/loadConfig";

const config = loadPipelineConfig();

async function main() {
  for (const tableConfig of config.tablesToBeGeocoded) {
    console.log(`🔄 Starte Geocoding für ${tableConfig.table}`);
    await geocodeTable(tableConfig);
  }

  console.log("🏁 Geocoding komplett.");
}

main();
