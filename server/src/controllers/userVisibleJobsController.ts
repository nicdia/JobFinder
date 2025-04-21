import { Request, Response } from "express";
import { queryUserVisibleJobs } from "../db/jobsRepo";

export async function getUserVisibleJobs(req: Request, res: Response) {
  const paramUserId = parseInt(req.params.userId, 10);
  const tokenUserId = (req as any).user?.id;

  if (paramUserId !== tokenUserId) {
    return res.status(403).json({ error: "Nicht autorisiert" });
  }

  try {
    const jobs = await queryUserVisibleJobs(tokenUserId);
    res.json({
      type: "FeatureCollection",
      features: jobs,
    });
  } catch (err) {
    console.error("Fehler bei /userVisibleJobs:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
}
