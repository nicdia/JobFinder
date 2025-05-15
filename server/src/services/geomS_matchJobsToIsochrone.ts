import {
  getLatestPolygonIdByUser,
  deleteUserMatchedJobs,
  insertUserMatchedJobs,
} from "../db/geometryOpsRepo";

/**
 * Berechnet alle Jobs, die im aktuellsten Polygon eines Users liegen,
 * und speichert sie in account.user_jobs_within_radius.
 */
export async function matchJobsToPolygone(userId: number) {
  const polygonId = await getLatestPolygonIdByUser(userId);

  if (!polygonId) {
    console.warn(`⚠️ Kein Polygon für User ${userId} gefunden.`);
    return;
  }

  //await deleteUserMatchedJobs(userId);
  await insertUserMatchedJobs(userId, polygonId);

  console.log(
    `✅ Sichtbare Jobs für User ${userId} basierend auf Polygon aktualisiert.`
  );
}
