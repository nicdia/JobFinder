// src/routes/userInputSearchRequest.route.ts
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { handleUserInputSearchRequest } from "../controllers/inputSeachRequestController";

const router = Router();

/**
 * POST /api/userInputSearchRequest/:userId
 * Erwartet strukturierte Antworten des Users zu Jobpräferenzen + Adresse usw.
 */
router.post(
  "/userInputSearchRequest/:userId",
  authenticateToken,
  handleUserInputSearchRequest as any
);

export default router;
