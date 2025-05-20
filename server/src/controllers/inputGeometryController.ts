import { Request, Response } from "express";
import { processUserGeometry } from "../services/geometryService";

export async function handleUserGeometryInput(req: Request, res: Response) {
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
    const result = await processUserGeometry(paramUserId, geometry, req.body);
    res.status(201).json(result);
  } catch (err: any) {
    console.error("❌ Fehler im Controller:", err);
    res.status(500).json({ error: err.message || "Interner Serverfehler" });
  }
}

export async function getUserIsochroneCenters(req: Request, res: Response) {
  const tokenUserId = (req as any).user?.id;
  const paramUserId = parseInt(req.params.userId, 10);

  if (tokenUserId !== paramUserId) {
    return res.status(403).json({ error: "Nicht autorisiert" });
  }

  try {
    const features = await queryIsochroneCenters(paramUserId);
    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (err: any) {
    console.error("❌ Fehler im Controller GET:", err);
    res.status(500).json({ error: err.message || "Interner Serverfehler" });
  }
}
