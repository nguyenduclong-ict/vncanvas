import type { H3Event } from "h3";
import { useDb } from "./db";
import { jobs } from "~~/db/schema";

import { getServerUrl } from "./getServerUrl";
import { useRuntimeConfig } from "#imports";

export async function addJobToQueue(
  event: H3Event,
  queueName: string,
  data: any
) {
  const db = useDb(event);

  // 1. Insert job into DB
  await db.insert(jobs).values({
    queue: queueName,
    data: data,
    status: "pending",
  });

  // 2. Trigger worker (fire and forget via waitUntil)
  // We need to know the SERVER_URL.
  // In Cloudflare Workers, we can use env vars.
  const config = useRuntimeConfig(event);
  const cloudflareEnv = event.context.cloudflare?.env;

  // Prefer env var from Cloudflare context, then runtime config
  const serverUrl = getServerUrl(event);

  console.log("serverUrl", serverUrl);

  if (serverUrl) {
    const triggerUrl = `${serverUrl}/api/admin/queue/trigger`;

    // Use waitUntil to avoid blocking the response
    const triggerPromise = $fetch(triggerUrl, {
      method: "POST",
      body: {
        secret: cloudflareEnv?.QUEUE_SECRET || config.queueSecret, // Use secret from env
        queueName,
      },
      ignoreResponseError: true, // Don't crash if trigger fails
    })
      .catch((err) => {
        console.error("Failed to trigger queue:", err);
      })
      .then(() => {
        console.log("Triggered queue");
      });

    if (event.waitUntil) {
      event.waitUntil(triggerPromise);
    } else {
      // If no waitUntil (not in worker?), just let it float (or await if critical?)
      // For fire-and-forget without blocking, we just don't await it here.
      // But in Node environment it might be killed?
      // For now, assuming standard Nuxt/Nitro behavior.
      await triggerPromise;
    }
  } else {
    console.warn("SERVER_URL not set, queue trigger skipped (job saved).");
  }
}
