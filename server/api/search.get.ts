// Search API - query destinations from database with filters and pagination
import { and, count, eq, like, or } from "drizzle-orm";
import { destinations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const db = useDb(event);
  const query = getQuery(event);

  const keyword = (query.q as string) || "";
  const category = (query.category as string) || "all";
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 9;
  const offset = (page - 1) * limit;

  // Build dynamic conditions
  const conditions = [];

  if (keyword) {
    conditions.push(
      or(
        like(destinations.title, `%${keyword}%`),
        like(destinations.shortDesc, `%${keyword}%`),
        like(destinations.longDesc, `%${keyword}%`)
      )
    );
  }

  if (category && category !== "all") {
    conditions.push(eq(destinations.category, category));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ total: count() })
    .from(destinations)
    .where(whereClause)
    .get();
  const total = countResult?.total || 0;

  // Get paginated results
  const results = await db
    .select({
      id: destinations.id,
      slug: destinations.slug,
      title: destinations.title,
      region: destinations.region,
      category: destinations.category,
      shortDesc: destinations.shortDesc,
      thumbnail: destinations.thumbnail,
    })
    .from(destinations)
    .where(whereClause)
    .orderBy(destinations.id)
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
