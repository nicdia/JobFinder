import { getLatestPolygonIdByUser } from "../db/drawnRequestRepo";
import { insertUserMatchedJobs } from "../db/jobsRepo";
/**
 * Fügt alle Jobs hinzu, die in einem bestimmten (oder dem neuesten) Search-Area-Polygon liegen,
 * und schreibt sie nach account.user_jobs_within_search_area.
 *
 * @param userId        ID des Users
 * @param searchAreaId  (optional) konkrete Search-Area-ID; wenn nicht angegeben,
 *                      wird das zuletzt angelegte Polygon des Users verwendet.
 */
export async function matchJobsToPolygone(
  userId: number,
  searchAreaId?: number
) {
  const polygonId = searchAreaId ?? (await getLatestPolygonIdByUser(userId));

  if (!polygonId) {
    console.warn(
      `⚠️ matchJobsToPolygone: Kein Polygon für User ${userId} gefunden.`
    );
    return;
  }

  await insertUserMatchedJobs(userId, polygonId);

  console.log(
    `✅ Jobs für User ${userId} basierend auf SearchArea ${polygonId} aktualisiert.`
  );
}
