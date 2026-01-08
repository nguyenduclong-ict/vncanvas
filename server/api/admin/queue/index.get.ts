import { and, count, eq } from "drizzle-orm";
import { useDb } from "~~/server/utils/db";
import { jobs, queueSettings } from "~~/db/schema";
import { consumers } from "~~/server/consumers";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const secret = query.secret as string;

  const config = useRuntimeConfig(event);
  const cloudflareEnv = event.context.cloudflare?.env;
  const envSecret =
    cloudflareEnv?.QUEUE_SECRET ||
    config.queueSecret ||
    process.env.QUEUE_SECRET;

  // Alloc if secret matches (Worker) OR if user is authenticated admin (UI)
  const isAdmin = !!event.context.user;
  const isSecretValid = secret && secret === envSecret;

  if (!isAdmin && !isSecretValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const db = useDb(event);

  // keys from consumers registry
  const queueNames = Object.keys(consumers);

  // Also find queues in DB that might not have consumers registered (orphaned?)
  // User asked for "Api get list queue + trạng thái: tên, descrition, running job, pending job"
  // Assuming we list available consumers.

  const result = [];

  for (const name of queueNames) {
    const consumerInfo = consumers[name];

    // Get stats
    const pendingCount = await db
      .select({ count: count() })
      .from(jobs)
      .where(and(eq(jobs.queue, name), eq(jobs.status, "pending")))
      .get();

    const runningCount = await db
      .select({ count: count() })
      .from(jobs)
      .where(and(eq(jobs.queue, name), eq(jobs.status, "running")))
      .get();

    // Get settings
    const setting = await db
      .select()
      .from(queueSettings)
      .where(eq(queueSettings.queue, name))
      .get();

    result.push({
      name: name,
      description: consumerInfo.description,
      running: runningCount?.count || 0,
      pending: pendingCount?.count || 0,
      concurrency: setting?.concurrency || 1,
    });
  }

  return { queues: result };
});
