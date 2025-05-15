import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  handleUserInputSearchRequest,
  getUserSearchRequests,
} from "../controllers/inputSeachRequestController";

const router = Router();

/**
 * GET  /api/userInputSearchRequest/:userId
 * Liefert alle bestehenden Suchgebiete als GeoJSON-FeatureCollection
 * POST /api/userInputSearchRequest/:userId
 * Legt eine neue Suchanfrage (Geometrie oder Adresse) an
 */
router
  .route("/userInputSearchRequest/:userId")
  .all(authenticateToken)
  .get(getUserSearchRequests as any)
  .post(handleUserInputSearchRequest as any);

export default router;
