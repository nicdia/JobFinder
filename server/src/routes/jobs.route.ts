// src/routes/jobs.route.ts
import { Router } from "express";
import pool from "../db";

const router = Router();

router.get("/jobs", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        'Feature' AS type,
        ST_AsGeoJSON(geom)::json AS geometry,
        to_jsonb(j) - 'geom' AS properties
      FROM base.jobs_ba j
      WHERE geom IS NOT NULL;
    `);

    res.json({
      type: "FeatureCollection",
      features: result.rows,
    });
  } catch (err) {
    console.error("Fehler bei /jobs:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

export default router;
