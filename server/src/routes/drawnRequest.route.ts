// src/routes/drawnRequest.route.ts
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  handleDrawnGeometryInput,
  getDrawnRequest,
  deleteDrawnSearchRequest,
  updateDrawnSearchRequest,
} from "../controllers/drawnRequestController";

const router = Router();

router
  .route("/drawRequest/:userId")
  .all(authenticateToken)
  .get(getDrawnRequest as any)
  .post(handleDrawnGeometryInput as any);

router
  .route("/drawRequest/:userId/:requestId")
  .all(authenticateToken)
  .delete(deleteDrawnSearchRequest as any)
  .put(updateDrawnSearchRequest as any);

export default router;
