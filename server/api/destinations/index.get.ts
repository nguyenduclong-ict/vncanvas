import { eq, and, or, inArray, sql } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const lang = (query.lang as string) || "vi";
  const db = useDb(event);

  // Fetch all shared data joined with relevant translations
  // We fetch both the requested language AND the default language ('vi')
  // to handle fallback on a per-item basis.
  const rows = await db
    .select({
      id: destinations.id,
      slug: destinations.slug,
      region: destinations.region,
      category: destinations.category,
      thumbnail: destinations.thumbnail,
      // Translation fields
      lang: destinationTranslations.languageCode,
      title: destinationTranslations.title,
      shortDesc: destinationTranslations.shortDesc,
    })
    .from(destinations)
    .leftJoin(
      destinationTranslations,
      and(
        eq(destinationTranslations.destinationId, destinations.id),
        or(
          eq(destinationTranslations.languageCode, lang),
          eq(destinationTranslations.languageCode, "vi")
        )
      )
    );

  // Process rows to pick the best translation for each destination
  const result = Object.values(
    rows.reduce((acc, row) => {
      // If we haven't seen this destination yet, or if this row is the requested language (overwrite fallback)
      if (!acc[row.id] || row.lang === lang) {
        if (row.title) {
          // Only add if translation exists (title is not null)
          acc[row.id] = {
            id: row.id,
            slug: row.slug,
            title: row.title,
            region: row.region,
            category: row.category,
            shortDesc: row.shortDesc,
            thumbnail: row.thumbnail,
          };
        }
      }
      return acc;
    }, {} as Record<number, any>)
  );

  return result;
});
