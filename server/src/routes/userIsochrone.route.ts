import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { getUserIsochrone } from "../controllers/isochroneController";

const router = Router();

router
  .route("/userInputSearchRequest/:userId")
  .all(authenticateToken)
  .get(getUserIsochrone as any);

export default router;
