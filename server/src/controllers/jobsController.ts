import { Request, Response } from "express";
import { queryAllJobs } from "../db/jobsRepo";

export async function getAllJobs(req: Request, res: Response) {
  try {
    const jobs = await queryAllJobs();

    res.json({
      type: "FeatureCollection",
      features: jobs,
    });
  } catch (err) {
    console.error("❌ Fehler beim Abrufen der Jobs:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
}
