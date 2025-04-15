// routes/accessibleJobs.route.ts

import { Router } from "express";
import pool from "../utils/db";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/accessibleJobs/:userId",
  authenticateToken,
  async (req: any, res: any) => {
    const paramUserId = parseInt(req.params.userId, 10);
    const tokenUserId = req.user?.id;

    if (paramUserId !== tokenUserId) {
      return res.status(403).json({ error: "Nicht autorisiert" });
    }

    try {
      const result = await pool.query(
        `
        SELECT
          j.id,
          'Feature' AS type,
          ST_AsGeoJSON(j.geom)::json AS geometry,
          to_jsonb(j) - 'geom' AS properties
        FROM account.user_visible_jobs uvj
        JOIN mart.jobs j ON uvj.job_id = j.id
        WHERE uvj.user_id = $1 AND j.geom IS NOT NULL;
        `,
        [tokenUserId]
      );

      res.json({
        type: "FeatureCollection",
        features: result.rows,
      });
    } catch (err) {
      console.error("Fehler bei /accessibleJobs:", err);
      res.status(500).json({ error: "Datenbankfehler" });
    }
  }
);

export default router;
