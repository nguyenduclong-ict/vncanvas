import { eq, sql } from "drizzle-orm";
import { useDb } from "~~/server/utils/db";
import { queueSettings } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { secret, queueName, concurrency } = body;

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

  if (!queueName || typeof concurrency !== "number") {
    throw createError({
      statusCode: 400,
      statusMessage: "queueName and concurrency (number) are required",
    });
  }

  const db = useDb(event);

  // Upsert settings
  await db
    .insert(queueSettings)
    .values({
      queue: queueName,
      concurrency,
    })
    .onConflictDoUpdate({
      target: queueSettings.queue,
      set: { concurrency, updatedAt: new Date().toISOString() }, // SQLite uses string for dates usually or we format strictly?
      // Schema defines updatedAt as text. db.ts uses sql`CURRENT_TIMESTAMP` default.
      // Here we can use SQL or string. Let's use string or sql.
    });

  return { status: "ok", settings: { queue: queueName, concurrency } };
});
