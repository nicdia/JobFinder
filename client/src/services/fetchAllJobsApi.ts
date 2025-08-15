import { api } from "../utils/api"; // Pfad anpassen

export const fetchAllJobs = async () => {
  return api.get("/jobs");
};
