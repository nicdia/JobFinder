import { Router } from "express";
import { getAllJobs } from "../controllers/allJobsController";

const router = Router();

router.get("/jobs", getAllJobs);

export default router;
