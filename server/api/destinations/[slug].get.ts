import { eq, and } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params || {};
  const query = getQuery(event);
  const lang = (query.lang as string) || "vi";
  const db = useDb(event);

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug is required",
    });
  }

  // 1. Find the destination entity first (Shared Data)
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

  // 2. Find the translation (Localized Data)
  // Priority: Requested Lang -> Default (vi) -> Any
  let translation = await db
    .select()
    .from(destinationTranslations)
    .where(
      and(
        eq(destinationTranslations.destinationId, destination.id),
        eq(destinationTranslations.languageCode, lang)
      )
    )
    .get();

  // 3. Fallback to default language ('vi') if specific lang not found
  if (!translation && lang !== "vi") {
    translation = await db
      .select()
      .from(destinationTranslations)
      .where(
        and(
          eq(destinationTranslations.destinationId, destination.id),
          eq(destinationTranslations.languageCode, "vi")
        )
      )
      .get();
  }

  if (!translation) {
    throw createError({
      statusCode: 404, // Should ideally not happen if seed is consistent
      statusMessage: "Translation not found",
    });
  }

  // 4. Merge and Return
  return {
    ...destination,
    ...translation,
    // Parse JSON fields
    moodTags: destination.moodTags,
    detailJson: translation.detailJson
      ? JSON.parse(translation.detailJson)
      : null,
    // Add explicitly to help frontend know which language content is being served
    languageCode: translation.languageCode,
  };
});
