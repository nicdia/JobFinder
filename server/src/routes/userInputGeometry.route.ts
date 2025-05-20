// src/routes/userInputGeometry.route.ts
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  handleUserGeometryInput,
  getUserIsochroneCenters, // ⬅️ NEW
} from "../controllers/inputGeometryController";

const router = Router();

router
  .route("/userInputGeometry/:userId")
  .all(authenticateToken)
  .get(getUserIsochroneCenters as any) // ⬅️ NEW
  .post(handleUserGeometryInput as any);

export default router;
