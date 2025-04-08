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
        json_build_object(
          'title', title,
          'company', company,
          'description', description,
          'location', location
        ) AS properties
      FROM stage.jobs;
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
