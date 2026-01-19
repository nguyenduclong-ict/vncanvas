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
  const { env } = event.context.cloudflare;

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

  if (env?.WORKER) {
    const request = new Request("https://internal/api/admin/queue/trigger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: cloudflareEnv?.NUXT_QUEUE_SECRET || config.queueSecret, // Use secret from env
        queueName,
      }),
    });

    const triggerPromise = await env.WORKER.fetch(request)
      .then((res: any) => res.text())
      .then((res: any) => {
        console.log("Triggered queue", res);
      })
      .catch((err: any) => console.error("Failed to trigger queue:", err));
    if (event.waitUntil) {
      event.waitUntil(triggerPromise);
    } else {
      await triggerPromise;
    }
  } else if (serverUrl) {
    const triggerUrl = `${serverUrl}/api/admin/queue/trigger`;

    // Use waitUntil to avoid blocking the response
    const triggerPromise = $fetch(triggerUrl, {
      method: "POST",
      body: {
        secret: cloudflareEnv?.NUXT_QUEUE_SECRET || config.queueSecret, // Use secret from env
        queueName,
      },
      ignoreResponseError: true, // Don't crash if trigger fails
    })
      .catch((err) => {
        console.error("Failed to trigger queue:", err);
      })
      .then((response) => {
        console.log("Triggered queue", response);
      });

    if (event.waitUntil) {
      event.waitUntil(triggerPromise);
    } else {
      await triggerPromise;
    }
  } else {
    console.warn("SERVER_URL not set, queue trigger skipped (job saved).");
  }
}
