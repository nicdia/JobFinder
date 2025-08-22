import { Request, Response } from "express";
import {
  queryUserSavedJobs,
  saveJobForUser,
  deleteSavedJob,
} from "../db/savedJobsRepo";

export async function getUserSavedJobs(req: Request, res: Response) {
  const paramUserId = parseInt(req.params.userId, 10);
  const tokenUserId = (req as any).user?.id;

  console.log(
    "[GET /savedJobs] paramUserId:",
    paramUserId,
    "tokenUserId:",
    tokenUserId
  );

  if (paramUserId !== tokenUserId) {
    console.warn("[GET /savedJobs] 403 – User-Mismatch");
    return res.status(403).json({ error: "Nicht autorisiert" });
  }

  try {
    const features = await queryUserSavedJobs(tokenUserId);
    console.log("[GET /savedJobs] → success, features:", features.length);
    return res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error("[GET /savedJobs] DB-Fehler:", err);
    return res.status(500).json({ error: "Datenbankfehler" });
  }
}

export async function postSaveJobForUser(req: Request, res: Response) {
  const paramUserId = parseInt(req.params.userId, 10);
  const tokenUserId = (req as any).user?.id;
  const { jobId } = req.body ?? {};

  console.log(
    "[POST /savedJobs] paramUserId:",
    paramUserId,
    "tokenUserId:",
    tokenUserId,
    "jobId:",
    jobId
  );

  if (paramUserId !== tokenUserId) {
    console.warn("[POST /savedJobs] 403 – User-Mismatch");
    return res.status(403).json({ error: "Nicht autorisiert" });
  }
  if (!Number.isInteger(jobId)) {
    return res.status(400).json({ error: "jobId fehlt oder ist ungültig" });
  }

  try {
    const result = await saveJobForUser(tokenUserId, jobId);
    // result: { saved: boolean, alreadyExisted?: boolean, reason?: string }
    if (result.saved) return res.status(200).json(result);
    // z. B. wenn Job nicht (mehr) sichtbar/auffindbar war:
    return res
      .status(404)
      .json({ error: "Job nicht gefunden oder nicht sichtbar" });
  } catch (err) {
    console.error("[POST /savedJobs] DB-Fehler:", err);
    return res.status(500).json({ error: "Datenbankfehler" });
  }
}

export async function deleteSavedJobForUser(req: Request, res: Response) {
  const paramUserId = parseInt(req.params.userId, 10);
  const tokenUserId = (req as any).user?.id;
  const jobId = parseInt(req.params.jobId, 10);

  console.log(
    "[DELETE /savedJobs] paramUserId:",
    paramUserId,
    "tokenUserId:",
    tokenUserId,
    "jobId:",
    jobId
  );

  if (paramUserId !== tokenUserId) {
    console.warn("[DELETE /savedJobs] 403 – User-Mismatch");
    return res.status(403).json({ error: "Nicht autorisiert" });
  }
  if (!Number.isInteger(jobId)) {
    return res.status(400).json({ error: "jobId ungültig" });
  }

  try {
    const { deleted } = await deleteSavedJob(tokenUserId, jobId);
    if (!deleted)
      return res.status(404).json({ error: "Eintrag nicht gefunden" });
    return res.status(200).json({ deleted: true });
  } catch (err) {
    console.error("[DELETE /savedJobs] DB-Fehler:", err);
    return res.status(500).json({ error: "Datenbankfehler" });
  }
}
