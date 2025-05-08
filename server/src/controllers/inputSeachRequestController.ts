// src/controllers/inputSearchRequestController.ts
import { Request, Response } from "express";
import { processUserSearchRequest } from "../services/searchRequestService";

export async function handleUserInputSearchRequest(
  req: Request,
  res: Response
) {
  const tokenUserId = (req as any).user?.id;
  const paramUserId = parseInt(req.params.userId, 10);

  if (tokenUserId !== paramUserId) {
    return res.status(403).json({ error: "Nicht autorisiert" });
  }

  const requestData = req.body;

  try {
    await processUserSearchRequest(paramUserId, requestData);
    res.status(201).json({ message: "Suchauftrag gespeichert" });
  } catch (err: any) {
    console.error("❌ Fehler im Controller:", err);
    res.status(500).json({ error: err.message || "Interner Serverfehler" });
  }
}
