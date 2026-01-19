import { eq, and, asc, count, sql } from "drizzle-orm";
import { useDb } from "~~/server/utils/db";
import { getServerUrl } from "~~/server/utils/getServerUrl";
import { jobs, queueSettings, type Job } from "~~/db/schema";
import { consumers } from "~~/server/consumers";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { queueName } = body;

  const config = useRuntimeConfig(event);
  const cloudflareEnv = event.context.cloudflare?.env;
  const envSecret =
    cloudflareEnv?.NUXT_QUEUE_SECRET ||
    config.queueSecret ||
    process.env.NUXT_QUEUE_SECRET;

  console.log("trigger queue", queueName);

  if (!queueName) {
    throw createError({
      statusCode: 400,
      statusMessage: "queueName is required",
    });
  }

  // 2. Return immediately
  // Logic inside event.waitUntil
  const processLogic = async () => {
    const db = useDb(event);

    let pickedJob: any = null;
    let concurrencyLimit = 1;

    try {
      // --- LOCK & PICK JOB ---
      // D1 simple transaction
      console.log(`[Queue: ${queueName}] processing started.`);

      // Transaction removed for local dev compatibility
      const tx = db;

      // Get concurrency setting
      const settings = await tx
        .select()
        .from(queueSettings)
        .where(eq(queueSettings.queue, queueName))
        .get();

      concurrencyLimit = settings?.concurrency || 1;

      // Count running jobs
      const runningCountRes = await tx
        .select({ count: count() })
        .from(jobs)
        .where(and(eq(jobs.queue, queueName), eq(jobs.status, "running")))
        .get();

      const runningCount = runningCountRes?.count || 0;

      if (runningCount >= concurrencyLimit) {
        console.log(
          `[Queue: ${queueName}] Max concurrency reached (${runningCount}/${concurrencyLimit}). Aborting.`
        );
        return; // Abort
      }

      // Pick one pending job safely using atomic UPDATE ... RETURNING
      // This allows avoiding explicit table locks while preventing multiple workers from picking the same job.
      pickedJob = await tx
        .update(jobs)
        .set({ status: "running", updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(
          eq(
            jobs.id,
            // Subquery to find the first pending job
            sql`(SELECT id FROM jobs WHERE queue = ${queueName} AND status = 'pending' ORDER BY created_at ASC LIMIT 1)`
          )
        )
        .returning()
        .get();

      // No need for separate SELECT then UPDATE.
      // If pickedJob is undefined, it means no job was updated (queue empty or subquery found nothing).

      if (!pickedJob) {
        console.log(`[Queue: ${queueName}] No pending jobs.`);
      } else {
        // --- PROCESS JOB ---
        console.log(`[Queue: ${queueName}] Processing Job ID: ${pickedJob.id}`);
        try {
          const consumerEntry = consumers[queueName];
          if (consumerEntry) {
            await consumerEntry.consumer(pickedJob.data, event);
            console.log(
              `[Queue: ${queueName}] Job ID: ${pickedJob.id} SUCCESS.`
            );
            // Success: Delete job
            await db.delete(jobs).where(eq(jobs.id, pickedJob.id));
          } else {
            console.error(`[Queue: ${queueName}] No consumer found!`);
          }
        } catch (err) {
          console.error(
            `[Queue: ${queueName}] Job ID: ${pickedJob.id} FAILED.`,
            err
          );
          // Delete job on error to prevent it from being stuck in 'running'
          await db.delete(jobs).where(eq(jobs.id, pickedJob.id));
        }
      }
    } catch (err) {
      console.error(
        `[Queue: ${queueName}] Critical error in process logic:`,
        err
      );
    } finally {
      // --- RECURSIVE TRIGGER ---
      try {
        // Count pending jobs
        const pendingCountRes = await db
          .select({ count: count() })
          .from(jobs)
          .where(and(eq(jobs.queue, queueName), eq(jobs.status, "pending")))
          .get();

        const pendingCount = pendingCountRes?.count || 0;

        // Re-fetch concurrency (limit) just in case
        if (!concurrencyLimit) {
          const settings = await db
            .select()
            .from(queueSettings)
            .where(eq(queueSettings.queue, queueName))
            .get();
          concurrencyLimit = settings?.concurrency || 1;
        }

        const n = Math.min(pendingCount, concurrencyLimit);

        if (n > 0) {
          const serverUrl = getServerUrl(event);

          if (serverUrl) {
            const triggerUrl = `${serverUrl}/api/admin/queue/trigger`;
            console.log(
              `[Queue: ${queueName}] Triggering ${n} recursive calls.`
            );

            // Fire n requests
            const requests = Array.from({ length: n }).map(() =>
              $fetch(triggerUrl, {
                method: "POST",
                body: { secret: envSecret, queueName },
                ignoreResponseError: true,
              }).catch((e) => console.error("Recursive trigger failed", e))
            );

            await Promise.all(requests);
          }
        }
      } catch (finalErr) {
        console.error("Error in finally block (recursive trigger):", finalErr);
      }
    }
  };

  if (event.waitUntil) {
    event.waitUntil(processLogic());
  } else {
    processLogic();
  }

  console.log("trigger queue success", queueName);

  return { status: "ok" };
});
