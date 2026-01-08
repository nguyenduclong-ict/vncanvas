import type { H3Event } from "h3";

export function getServerUrl(event: H3Event): string | null {
  const config = useRuntimeConfig(event);
  const cloudflareEnv = event.context.cloudflare?.env;

  // Prefer env var from Cloudflare context, then runtime config
  let serverUrl =
    cloudflareEnv?.SERVER_URL || config.serverUrl || process.env.SERVER_URL;

  // Auto-detect localhost in dev mode
  if (import.meta.dev && !serverUrl) {
    try {
      const url = getRequestURL(event);
      serverUrl = url.origin;
    } catch (e) {
      // Fallback
      serverUrl = "http://localhost:3000";
    }
  }

  return serverUrl || null;
}
