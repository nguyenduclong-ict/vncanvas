export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);

  // In apiOnly mode, block all non-API routes with 404 JSON response
  if (config.onlyApi && !event.path.startsWith("/api/")) {
    setResponseStatus(event, 404);
    setResponseHeader(event, "Content-Type", "application/json");
    return { code: 404, message: "Not Found" };
  }
});
