import { eq } from "drizzle-orm";
import { useDb } from "~~/server/utils/db";
import { jobs, destinations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const jobId = parseInt(getRouterParam(event, "id") as string);

  if (!jobId || isNaN(jobId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid job ID",
    });
  }

  const db = useDb(event);

  // Get job to find the destination slug
  const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).get();

  if (!job) {
    throw createError({
      statusCode: 404,
      statusMessage: "Job not found",
    });
  }

  // Delete the job
  await db.delete(jobs).where(eq(jobs.id, jobId));

  // Reset aiGenStatus for the destination if it was processing
  if (job.data?.slug) {
    await db
      .update(destinations)
      .set({ aiGenStatus: null })
      .where(eq(destinations.slug, job.data.slug));
  }

  return {
    status: "ok",
    message: `Job ${jobId} deleted`,
  };
});
