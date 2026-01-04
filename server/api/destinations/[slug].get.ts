export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const db = event.context.cloudflare?.env?.DB;

  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database connection not available",
    });
  }

  try {
    const destination = await db
      .prepare("SELECT * FROM destinations WHERE slug = ?")
      .bind(slug)
      .first();

    if (!destination) {
      throw createError({
        statusCode: 404,
        statusMessage: "Destination not found",
      });
    }

    // Parse JSON fields
    if (destination.mood_tags) {
      destination.mood_tags = JSON.parse(destination.mood_tags as string);
    }
    if (destination.detail_json) {
      destination.detail_json = JSON.parse(destination.detail_json as string);
    }

    return destination;
  } catch (error: any) {
    if (error.statusCode === 404) throw error;
    console.error("Database error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch destination",
    });
  }
});
