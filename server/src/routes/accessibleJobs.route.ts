import { Router } from "express";
import pool from "../utils/db";

const router = Router();

router.get("/accessibleJobs/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const result = await pool.query(
      `
        SELECT
          j.id,
          'Feature' AS type,
          ST_AsGeoJSON(j.geom)::json AS geometry,
          to_jsonb(j) - 'geom' AS properties
        FROM account.user_visible_jobs uvj
        JOIN mart.jobs j ON uvj.id = j.id
        WHERE uvj.user_id = $1 AND j.geom IS NOT NULL;
      `,
      [userId]
    );

    res.json({
      type: "FeatureCollection",
      features: result.rows,
    });
  } catch (err) {
    console.error("Fehler bei /accessibleJobs:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

export default router;
