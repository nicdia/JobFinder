// src/routes/userInputGeometry.route.ts
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  handleDrawnGeometryInput,
  getDrawnRequest,
} from "../controllers/drawnRequestController";

const router = Router();

router
  .route("/drawRequest/:userId")
  .all(authenticateToken)
  .get(getDrawnRequest as any)
  .post(handleDrawnGeometryInput as any);

export default router;
