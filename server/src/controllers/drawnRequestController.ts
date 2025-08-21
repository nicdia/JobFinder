import { Request, Response } from "express";
import { processRequestDrawnGeometry } from "../services/DrawnRequestService";
import {
  queryDrawnRequest,
  deleteDrawnRequestCascade,
} from "../db/drawnRequestRepo"; // ⬅️ import erweitert

export async function handleDrawnGeometryInput(req: Request, res: Response) {
  const tokenUserId = (req as any).user?.id;
  const paramUserId = parseInt(req.params.userId, 10);
  const geometry = req.body.geometry;

  if (tokenUserId !== paramUserId) {
    return res.status(403).json({ error: "Nicht autorisiert" });
  }

  if (
    !geometry ||
    !["Polygon", "Point", "LineString"].includes(geometry.type)
  ) {
    return res.status(400).json({
      error: "Ungültige Geometrie – nur Polygon, LineString oder Point erlaubt",
    });
  }

  try {
    const result = await processRequestDrawnGeometry(
      paramUserId,
      geometry,
      req.body
    );
    res.status(201).json(result);
  } catch (err: any) {
    console.error("❌ Fehler im Controller:", err);
    res.status(500).json({ error: err.message || "Interner Serverfehler" });
  }
}

export async function getDrawnRequest(req: Request, res: Response) {
  const tokenUserId = (req as any).user?.id;
  const paramUserId = parseInt(req.params.userId, 10);

  if (tokenUserId !== paramUserId) {
    return res.status(403).json({ error: "Nicht autorisiert" });
  }

  try {
    const features = await queryDrawnRequest(paramUserId);
    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (err: any) {
    console.error("❌ Fehler im Controller GET:", err);
    res.status(500).json({ error: err.message || "Interner Serverfehler" });
  }
}

export async function deleteDrawnSearchRequest(req: Request, res: Response) {
  const tokenUserId = (req as any).user?.id;
  const paramUserId = parseInt(req.params.userId, 10);
  const requestId = parseInt(req.params.requestId, 10);

  if (Number.isNaN(requestId)) {
    return res.status(400).json({ error: "Ungültige requestId" });
  }
  if (tokenUserId !== paramUserId) {
    return res.status(403).json({ error: "Nicht autorisiert" });
  }

  try {
    console.log(
      `[DELETE /api/drawRequest/${paramUserId}/${requestId}] → start`
    );
    const { deleted } = await deleteDrawnRequestCascade(paramUserId, requestId);
    if (!deleted) {
      return res.status(404).json({ error: "Suchauftrag nicht gefunden" });
    }
    console.log(
      `[DELETE /api/drawRequest/${paramUserId}/${requestId}] → success`
    );
    res.status(204).send();
  } catch (err: any) {
    console.error(
      `[DELETE /api/drawRequest/${paramUserId}/${requestId}] DB-Fehler:`,
      err
    );
    res.status(500).json({ error: err.message || "Interner Serverfehler" });
  }
}
