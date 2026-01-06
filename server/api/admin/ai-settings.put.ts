import { setMaxParallelJobs, getMaxParallelJobs } from "../../utils/aiQueue";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (typeof body.maxParallelJobs === "number") {
    setMaxParallelJobs(body.maxParallelJobs);
  }

  return {
    success: true,
    maxParallelJobs: getMaxParallelJobs(),
  };
});
