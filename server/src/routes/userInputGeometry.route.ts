import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { handleUserGeometryInput } from "../controllers/geometryController";

const router = Router();

/**
 * POST /api/userInputGeometry/:userId
 * Erwartet GeoJSON-Objekt vom Typ: Polygon, Point oder LineString
 * Optional: zusätzliche Parameter wie cutoff, mode, speed, date, time
 */
router.post(
  "/userInputGeometry/:userId",
  authenticateToken,
  handleUserGeometryInput as any
);

export default router;
