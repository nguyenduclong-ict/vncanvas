import { eq } from "drizzle-orm";
import { destinations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const db = useDb(event);

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug is required",
    });
  }

  const destination = await db
    .select()
    .from(destinations)
    .where(eq(destinations.slug, slug))
    .get();

  if (!destination) {
    throw createError({
      statusCode: 404,
      statusMessage: "Destination not found",
    });
  }

  // Parse JSON fields
  return {
    ...destination,
    moodTags: destination.moodTags ? JSON.parse(destination.moodTags) : null,
    detailJson: destination.detailJson
      ? JSON.parse(destination.detailJson)
      : null,
  };
});
