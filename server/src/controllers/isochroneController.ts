// src/controllers/inputSearchRequestController.ts
import { Request, Response } from "express";
import { queryUserIsochrone } from "../db/IsochroneRepo";

/**
 * GET /api/userInputSearchRequest/:userId
 * Liefert alle bestehenden Suchgebiete als GeoJSON-FeatureCollection.
 */
export async function getUserIsochrone(req: Request, res: Response) {
  const tokenUserId = (req as any).user?.id;
  const paramUserId = parseInt(req.params.userId, 10);

  console.log(
    `[GET /api/userInputSearchRequest/${paramUserId}] tokenUserId=${tokenUserId}`
  );
  if (tokenUserId !== paramUserId) {
    console.warn(
      `[GET /api/userInputSearchRequest/${paramUserId}] 403 – User-Mismatch`
    );
    return res.status(403).json({ error: "Nicht autorisiert" });
  }

  try {
    console.time(`[queryUserSearchAreas] Dauer (userId=${paramUserId})`);
    const areas = await queryUserIsochrone(paramUserId);
    console.timeEnd(`[queryUserSearchAreas] Dauer (userId=${paramUserId})`);
    console.log(
      `[GET /api/userInputSearchRequest/${paramUserId}] → success, found ${areas.length} areas`
    );

    res.json({
      type: "FeatureCollection",
      features: areas,
    });
  } catch (err: any) {
    console.error(
      `[GET /api/userInputSearchRequest/${paramUserId}] DB-Fehler:`,
      err
    );
    res.status(500).json({ error: err.message || "Datenbankfehler" });
  }
}
