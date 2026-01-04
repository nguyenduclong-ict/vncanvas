export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB;

  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database connection not available",
    });
  }

  try {
    const { results } = await db
      .prepare(
        "SELECT id, slug, title, region, category, short_desc, thumbnail FROM destinations ORDER BY id"
      )
      .all();

    return results || [];
  } catch (error) {
    console.error("Database error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch destinations",
    });
  }
});
