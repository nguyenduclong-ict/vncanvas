// Catch-all for undefined API routes - returns 404
export default defineEventHandler((event) => {
  throw createError({
    statusCode: 404,
    statusMessage: "API endpoint not found",
  });
});
