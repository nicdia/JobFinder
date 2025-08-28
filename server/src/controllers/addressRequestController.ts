import { Request, Response } from "express";
import { processAddressSearchRequest } from "../services/addressRequestService";
import {
  queryAddressRequest,
  deleteAddressRequestCascade,
} from "../db/addressRequestRepo";

export async function handleAddressSearchRequest(req: Request, res: Response) {
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
    await processAddressSearchRequest(paramUserId, req.body);
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

export async function getAddressRequest(req: Request, res: Response) {
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
    const areas = await queryAddressRequest(paramUserId);
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

export async function deleteAddressSearchRequest(req: Request, res: Response) {
  const tokenUserId = (req as any).user?.id;
  const paramUserId = parseInt(req.params.userId, 10);
  const requestId = parseInt(req.params.requestId, 10);

  if (Number.isNaN(requestId)) {
    return res.status(400).json({ error: "Ungültige requestId" });
  }

  if (tokenUserId !== paramUserId) {
    console.warn(
      `[DELETE /api/userInputSearchRequest/${paramUserId}/${requestId}] 403 – User-Mismatch`
    );
    return res.status(403).json({ error: "Nicht autorisiert" });
  }

  try {
    console.log(
      `[DELETE /api/userInputSearchRequest/${paramUserId}/${requestId}] → start`
    );
    const { deleted } = await deleteAddressRequestCascade(
      paramUserId,
      requestId
    );
    if (deleted === 0) {
      return res.status(404).json({ error: "Suchauftrag nicht gefunden" });
    }
    console.log(
      `[DELETE /api/userInputSearchRequest/${paramUserId}/${requestId}] → success`
    );
    res.status(204).send();
  } catch (err: any) {
    console.error(
      `[DELETE /api/userInputSearchRequest/${paramUserId}/${requestId}] DB-Fehler:`,
      err
    );
    res.status(500).json({ error: err.message || "Interner Serverfehler" });
  }
}
