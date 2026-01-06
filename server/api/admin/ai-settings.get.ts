import { getMaxParallelJobs } from "../../utils/aiQueue";

export default defineEventHandler(async () => {
  return {
    maxParallelJobs: getMaxParallelJobs(),
  };
});
