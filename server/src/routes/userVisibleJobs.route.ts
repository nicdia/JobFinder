import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { getUserVisibleJobs } from "../controllers/userVisibleJobsController";

const router = Router();

router.get(
  "/userVisibleJobs/:userId",
  authenticateToken,
  getUserVisibleJobs as any
);

export default router;
