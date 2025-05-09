import { Request, Response } from "express";
import { queryUserVisibleJobs } from "../db/jobsRepo";

export async function getUserVisibleJobs(req: Request, res: Response) {
  const paramUserId = parseInt(req.params.userId, 10);
  const tokenUserId = (req as any).user?.id;

  console.log(
    "[GET /userVisibleJobs] paramUserId:",
    paramUserId,
    "tokenUserId:",
    tokenUserId
  );

  if (paramUserId !== tokenUserId) {
    console.warn("[GET /userVisibleJobs] 403 – User‑Mismatch");
    return res.status(403).json({ error: "Nicht autorisiert" });
  }

  try {
    const jobs = await queryUserVisibleJobs(tokenUserId);
    console.log("[GET /userVisibleJobs] → success, features:", jobs.length);

    res.json({
      type: "FeatureCollection",
      features: jobs,
    });
  } catch (err) {
    console.error("[GET /userVisibleJobs] DB‑Fehler:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
}
