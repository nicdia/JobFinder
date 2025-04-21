import { Request, Response } from "express";
import {
  handleUserUpdate,
  handleUserDelete,
} from "../services/userManagementService";

export async function updateUserController(req: Request, res: Response) {
  const userId = Number(req.params.userId);
  const updates = req.body;

  try {
    const result = await handleUserUpdate(userId, updates);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("❌ Fehler beim Update:", err);
    res.status(500).json({ error: "Update fehlgeschlagen" });
  }
}

export async function deleteUserController(req: Request, res: Response) {
  const userId = Number(req.params.userId);

  try {
    const result = await handleUserDelete(userId);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("❌ Fehler beim Löschen:", err);
    res.status(500).json({ error: "Löschen fehlgeschlagen" });
  }
}
