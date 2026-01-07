export default defineEventHandler(async (event) => {
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
