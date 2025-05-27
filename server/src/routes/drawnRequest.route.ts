// src/routes/userInputGeometry.route.ts
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  handleDrawnGeometryInput,
  getDrawnRequest,
} from "../controllers/DrawnRequestController";

const router = Router();

router
  .route("/userInputGeometry/:userId")
  .all(authenticateToken)
  .get(getDrawnRequest as any)
  .post(handleDrawnGeometryInput as any);

export default router;
