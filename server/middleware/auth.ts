export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);

  if (event.path === "/api/admin/queue/trigger") {
    const body = await readBody(event);
    const { secret } = body;
    if (secret) {
      const config = useRuntimeConfig(event);
      const cloudflareEnv = event.context.cloudflare?.env;
      const envSecret =
        cloudflareEnv?.QUEUE_SECRET ||
        config.queueSecret ||
        process.env.QUEUE_SECRET;

      // 1. Auth Check
      if (!secret || secret !== envSecret) {
        throw createError({
          statusCode: 401,
          statusMessage: "Unauthorized",
        });
      }
    } else if (cookies.access_token) {
      const accessToken = cookies.access_token;
      // Check for authorization header
      if (!accessToken) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
      }

      const payload = await verifyToken(accessToken);

      if (!payload) {
        throw createError({ statusCode: 401, message: "Invalid token" });
      }

      event.context.user = payload;
    } else {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }
    return;
  }

  if (event.path.startsWith("/api/admin")) {
    const cookies = parseCookies(event);
    const accessToken = cookies.access_token;
    // Check for authorization header
    if (!accessToken) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const payload = await verifyToken(accessToken);

    if (!payload) {
      throw createError({ statusCode: 401, message: "Invalid token" });
    }

    event.context.user = payload;
  }
});
