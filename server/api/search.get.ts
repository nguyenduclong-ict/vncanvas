// Search API - query destinations from database with filters and pagination
import { and, count, eq, like, or } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const db = useDb(event);
  const query = getQuery(event);

  const keyword = (query.q as string) || "";
  const category = (query.category as string) || "all";
  const lang = (query.lang as string) || "vi";
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 9;
  const offset = (page - 1) * limit;

  // Conditions
  const conditions = [
    // Language: requested OR default
    or(
      eq(destinationTranslations.languageCode, lang),
      eq(destinationTranslations.languageCode, "vi")
    ),
  ];

  if (keyword) {
    conditions.push(
      or(
        like(destinationTranslations.title, `%${keyword}%`),
        like(destinationTranslations.shortDesc, `%${keyword}%`),
        like(destinationTranslations.longDesc, `%${keyword}%`)
      )
    );
  }

  if (category && category !== "all") {
    conditions.push(eq(destinations.category, category));
  }

  const whereClause = and(
    eq(destinationTranslations.destinationId, destinations.id),
    ...conditions
  );

  // Get total count
  const countResult = await db
    .select({ total: count() })
    .from(destinations)
    .innerJoin(
      destinationTranslations,
      eq(destinations.id, destinationTranslations.destinationId)
    ) // Explicit inner join for count
    .where(whereClause)
    .get();

  const total = countResult?.total || 0;

  // Get paginated results
  const results = await db
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
    .innerJoin(
      destinationTranslations,
      eq(destinations.id, destinationTranslations.destinationId)
    )
    .where(whereClause)
    // .orderBy(destinations.id) // Ordering might be ambiguous with duplicates, but okay for now
    .limit(limit)
    .offset(offset);

  return {
    data: results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
});
