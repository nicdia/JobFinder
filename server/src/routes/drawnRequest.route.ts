import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  handleDrawnGeometryInput,
  getDrawnRequest,
  deleteDrawnSearchRequest, // ⬅️ neu
} from "../controllers/drawnRequestController";

const router = Router();

router
  .route("/drawRequest/:userId")
  .all(authenticateToken)
  .get(getDrawnRequest as any)
  .post(handleDrawnGeometryInput as any);

// DELETE /api/drawRequest/:userId/:requestId
router
  .route("/drawRequest/:userId/:requestId")
  .all(authenticateToken)
  .delete(deleteDrawnSearchRequest as any); // ⬅️ neu

export default router;
