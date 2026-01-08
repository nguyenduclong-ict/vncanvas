import { eq, sql } from "drizzle-orm";
import { useDb } from "~~/server/utils/db";
import { jobs } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { secret, queueName } = body;

  const config = useRuntimeConfig(event);
  const cloudflareEnv = event.context.cloudflare?.env;
  const envSecret =
    cloudflareEnv?.QUEUE_SECRET ||
    config.queueSecret ||
    process.env.QUEUE_SECRET;

  // Allow if secret matches (Worker) OR if user is authenticated admin (UI)
  // Middleware 'auth.ts' sets event.context.user if token is valid for /api/admin/*
  const isAdmin = !!event.context.user;
  const isSecretValid = secret && secret === envSecret;

  if (!isAdmin && !isSecretValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const db = useDb(event);

  if (queueName) {
    await db.delete(jobs).where(eq(jobs.queue, queueName));
  } else {
    // Clear all if no queue specified? Dangerous but requested "clear toàn bộ queue"
    await db.delete(jobs);
  }

  return {
    status: "ok",
    message: queueName ? `Queue ${queueName} cleared` : "All queues cleared",
  };
});
