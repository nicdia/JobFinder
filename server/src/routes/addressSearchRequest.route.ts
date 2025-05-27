import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  handleAddressSearchRequest,
  getAddressRequest,
} from "../controllers/addressRequestController";

const router = Router();

router
  .route("/userInputSearchRequest/:userId")
  .all(authenticateToken)
  .post(handleAddressSearchRequest as any)
  .get(getAddressRequest as any);

export default router;
