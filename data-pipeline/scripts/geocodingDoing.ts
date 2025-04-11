import { geocodeTable } from "../../data-pipeline/src/utils/geocodingFunctionality";

async function main() {
  const tablesToGeocode = [
    {
      table: "base.jobs_adzuna",
      idField: "id",
      addressFields: ["company"],
      latField: "lat",
      lonField: "lon",
      geomField: "geom",
      limit: 25,
    },
  ];

  for (const tableConfig of tablesToGeocode) {
    console.log(`🔄 Starte Geocoding für ${tableConfig.table}`);
    await geocodeTable(tableConfig);
  }

  console.log("🏁 Geocoding komplett.");
}

main();
