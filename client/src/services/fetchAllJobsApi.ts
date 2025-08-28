import { api } from "../utils/api";

export const fetchAllJobs = async () => {
  return api.get("/jobs");
};
