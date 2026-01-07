export default defineEventHandler(async (event) => {
  if (event.path.startsWith("/api/admin")) {
    // Check for authorization header
    const authHeader = getRequestHeader(event, "Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);

    if (!payload) {
      throw createError({ statusCode: 401, message: "Invalid token" });
    }

    event.context.user = payload;
  }
});
