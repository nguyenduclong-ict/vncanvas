export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("error", async (error, { event }) => {
    // Only apply to /api/ routes
    if (event?.path.startsWith("/api/")) {
      // Determine status code
      // @ts-ignore
      const statusCode = error.statusCode || 500;
      const message = error.message || "Internal Server Error";

      // Set response
      setResponseStatus(event, statusCode);
      setResponseHeader(event, "Content-Type", "application/json");

      // Send JSON
      send(
        event,
        JSON.stringify({
          code: statusCode,
          message: message,
        })
      );
    }
  });
});
