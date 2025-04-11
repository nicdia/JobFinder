import pool from "../../server/src/db";
import fetch from "node-fetch";
import { GeocodeTableOptions } from "../types/types";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GMAPS_API_KEY;

// ----------- NOMINATIM
async function geocodeAddressWithNominatim(
  query: string
): Promise<[number, number] | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "YourAppName (your@email.com)",
    },
  });

  const data: any = await res.json();
  if (!data.length) return null;

  return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
}

// ----------- GOOGLE TEXT SEARCH
async function getPlaceIdFromGoogle(query: string): Promise<string | null> {
  if (!apiKey) throw new Error("🚨 GMAPS_API_KEY fehlt");

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query
  )}&key=${apiKey}`;

  console.log(`🔍 Google TextSearch: ${query}`);
  console.log(`🌐 URL: ${url}`);

  const res = await fetch(url);
  const data: any = await res.json();

  if (!data.results?.length) {
    console.warn(`❌ Kein Treffer bei Google TextSearch`);
    return null;
  }

  const placeId = data.results[0].place_id;
  console.log(`✅ Place ID gefunden: ${placeId}`);
  return placeId;
}

// ----------- GOOGLE PLACE DETAILS
async function getAddressFromPlaceId(placeId: string): Promise<string | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address&key=${apiKey}`;

  const res = await fetch(url);
  const data: any = await res.json();

  const address = data?.result?.formatted_address;
  if (!address) {
    console.warn(`❌ Keine Adresse gefunden in Place Details`);
    return null;
  }

  console.log(`🏠 Adresse von Google: ${address}`);
  return address;
}

// ----------- GOOGLE WORKFLOW KOMPAKT
async function lookupCompanyAddress(company: string): Promise<string | null> {
  const cleaned = company
    .replace(/\b(GmbH|AG|KG|Co\.|S\.A\.|S\.r\.l\.|e\.V\.)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const query = `${cleaned}, Deutschland`;
  const placeId = await getPlaceIdFromGoogle(query);
  if (!placeId) return null;

  return await getAddressFromPlaceId(placeId);
}

// ----------- MAIN FUNCTION
export async function geocodeTable(opts: GeocodeTableOptions) {
  const {
    table,
    idField,
    addressFields,
    latField,
    lonField,
    geomField,
    limit = 50,
  } = opts;

  const query = `
    SELECT ${idField}, ${addressFields.join(", ")}, company
    FROM ${table}
    WHERE (${latField} IS NULL OR ${lonField} IS NULL OR ${geomField} IS NULL)
    LIMIT $1;
  `;

  const result = await pool.query(query, [limit]);

  for (const row of result.rows) {
    const address = addressFields
      .map((field) => row[field])
      .filter((val): val is string => Boolean(val))
      .join(", ");

    console.log(`\n🔍 Versuche Geocoding für: ${address}`);

    // 1️⃣ Direktversuch mit Nominatim
    let coords = await geocodeAddressWithNominatim(address);

    // 2️⃣ Wenn Nominatim fehlschlägt → Google-Fallback
    if (!coords && row["company"]) {
      console.warn(
        `⚠️ Kein Nominatim-Treffer → versuche Google für: ${row["company"]}`
      );
      const googleAddress = await lookupCompanyAddress(row["company"]);

      if (googleAddress) {
        console.log(`📫 Google Adresse: ${googleAddress}`);
        coords = await geocodeAddressWithNominatim(googleAddress);
      } else {
        console.warn(`❌ Google konnte keine Adresse liefern`);
      }
    }

    // ✅ Speicherung in lat, lon und geom
    if (coords) {
      const [lon, lat] = coords;
      console.log(`✅ Erfolgreich geokodiert: ${lat}, ${lon}`);

      await pool.query(
        `
        UPDATE ${table}
        SET
          ${latField} = $1,
          ${lonField} = $2,
          ${geomField} = ST_SetSRID(ST_Point($1, $2), 4326)
        WHERE ${idField} = $3
        `,
        [lon, lat, row[idField]]
      );
    } else {
      console.error(`❌ Komplett fehlgeschlagen: ${address}`);
    }
  }

  console.log(`\n✅ Geocoding abgeschlossen für ${table}`);
}
