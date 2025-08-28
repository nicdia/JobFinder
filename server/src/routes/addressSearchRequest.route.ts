import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  handleAddressSearchRequest,
  getAddressRequest,
  deleteAddressSearchRequest,
} from "../controllers/addressRequestController";

const router = Router();

router
  .route("/userInputSearchRequest/:userId")
  .all(authenticateToken)
  .post(handleAddressSearchRequest as any)
  .get(getAddressRequest as any);

// DELETE /api/userInputSearchRequest/:userId/:requestId
router
  .route("/userInputSearchRequest/:userId/:requestId")
  .all(authenticateToken)
  .delete(deleteAddressSearchRequest as any);

export default router;
