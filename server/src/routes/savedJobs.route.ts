import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  getUserSavedJobs,
  postSaveJobForUser,
  deleteSavedJobForUser,
} from "../controllers/savedJobsController";

const router = Router();

router.get("/savedJobs/:userId", authenticateToken, getUserSavedJobs as any);
router.post("/savedJobs/:userId", authenticateToken, postSaveJobForUser as any);
router.delete(
  "/savedJobs/:userId/:jobId",
  authenticateToken,
  deleteSavedJobForUser as any
);

export default router;
