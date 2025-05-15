// src/controllers/inputSearchRequestController.ts
import { Request, Response } from "express";
import { processUserSearchRequest } from "../services/searchRequestService";
import { queryUserSearchAreas } from "../db/getSearchAreasRepo";

/**
 * POST /api/userInputSearchRequest/:userId
 * Verarbeitet eine neue Suchanfrage (Adresse oder Geometrie).
 */
export async function handleUserInputSearchRequest(
  req: Request,
  res: Response
) {
  const tokenUserId = (req as any).user?.id;
  const paramUserId = parseInt(req.params.userId, 10);

  if (tokenUserId !== paramUserId) {
    console.warn(
      `[POST /api/userInputSearchRequest/${paramUserId}] 403 – User-Mismatch`
    );
    return res.status(403).json({ error: "Nicht autorisiert" });
  }

  try {
    console.log(
      `[POST /api/userInputSearchRequest/${paramUserId}] → processing request`,
      req.body
    );
    await processUserSearchRequest(paramUserId, req.body);
    console.log(`[POST /api/userInputSearchRequest/${paramUserId}] → success`);
    res.status(201).json({ message: "Suchauftrag gespeichert" });
  } catch (err: any) {
    console.error(
      `[POST /api/userInputSearchRequest/${paramUserId}] DB-Fehler:`,
      err
    );
    res.status(500).json({ error: err.message || "Interner Serverfehler" });
  }
}

/**
 * GET /api/userInputSearchRequest/:userId
 * Liefert alle bestehenden Suchgebiete als GeoJSON-FeatureCollection.
 */
export async function getUserSearchRequests(req: Request, res: Response) {
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
    const areas = await queryUserSearchAreas(paramUserId);
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
