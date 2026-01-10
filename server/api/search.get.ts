// Search API - query destinations from database with filters and pagination
import { and, count, eq, like, or, sql } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const db = useDb(event);
  const query = getQuery(event);

  const keyword = (query.q as string) || "";
  const category = (query.category as string) || "all";
  const region = (query.region as string) || "";
  const province = (query.province as string) || "";
  const moodTags = (query.moodTags as string) || "";
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
    eq(destinations.isPublished, true),
  ];

  if (keyword) {
    conditions.push(
      or(
        like(destinations.name, `%${keyword}%`),
        like(destinationTranslations.title, `%${keyword}%`),
        like(destinationTranslations.shortDesc, `%${keyword}%`),
        like(destinationTranslations.longDesc, `%${keyword}%`)
      )
    );
  }

  if (category && category !== "all") {
    conditions.push(like(destinations.category, `%${category}%`));
  }

  if (region) {
    conditions.push(eq(destinations.region, region));
  }

  if (province) {
    conditions.push(like(destinations.province, `%${province}%`));
  }

  if (moodTags) {
    // Search for any of the mood tags
    const tags = moodTags.split(",");
    const moodConditions = tags.map((tag) =>
      like(destinations.moodTags, `%${tag.trim()}%`)
    );
    if (moodConditions.length > 0) {
      conditions.push(or(...moodConditions));
    }
  }

  const whereClause = and(
    eq(destinationTranslations.destinationId, destinations.id),
    ...conditions
  );

  // Get total count of UNIQUE destinations (not translation rows)
  const uniqueDestIds = await db
    .selectDistinct({ id: destinations.id })
    .from(destinations)
    .innerJoin(
      destinationTranslations,
      eq(destinations.id, destinationTranslations.destinationId)
    )
    .where(whereClause);

  const total = uniqueDestIds.length;

  // Get paginated results with language priority
  // Order by: 1) Requested language first, 2) destination ID
  const rawResults = await db
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
    .orderBy(
      // Prioritize requested language (0 for requested lang, 1 for 'vi')
      sql`CASE WHEN ${destinationTranslations.languageCode} = ${lang} THEN 0 ELSE 1 END`,
      destinations.id
    );

  // Deduplicate: Keep only the first (prioritized) translation per destination
  const seenIds = new Set<number>();
  const results = [];

  for (const row of rawResults) {
    if (!seenIds.has(row.id)) {
      seenIds.add(row.id);
      results.push(row);

      // Stop once we have enough for this page
      if (results.length >= offset + limit) {
        break;
      }
    }
  }

  // Apply pagination to deduplicated results
  const paginatedResults = results.slice(offset, offset + limit);

  return {
    data: paginatedResults,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
});
