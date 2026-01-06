import { desc, eq, sql, like, and, isNull } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  // Filter parameters
  const region = query.region as string | undefined;
  const category = query.category as string | undefined;
  const status = query.status as string | undefined;
  const aiStatus = query.aiStatus as string | undefined;
  const missingLang = query.missingLang as string | undefined;
  const search = query.q as string | undefined;

  const db = useDb(event);

  // Build where conditions
  const conditions: any[] = [];

  if (region) {
    conditions.push(eq(destinations.region, region as any));
  }

  if (category) {
    conditions.push(like(destinations.category, `%${category}%`));
  }

  if (status === "published") {
    conditions.push(eq(destinations.isPublished, true));
  } else if (status === "draft") {
    conditions.push(eq(destinations.isPublished, false));
  }

  if (aiStatus === "processing") {
    conditions.push(eq(destinations.aiGenStatus, "processing"));
  } else if (aiStatus === "done") {
    conditions.push(eq(destinations.aiGenStatus, "done"));
  } else if (aiStatus === "error") {
    conditions.push(eq(destinations.aiGenStatus, "error"));
  } else if (aiStatus === "not_generated") {
    conditions.push(isNull(destinations.aiGenStatus));
  }

  if (missingLang) {
    conditions.push(sql`NOT EXISTS (
      SELECT 1 FROM destination_translations 
      WHERE destination_id = destinations.id 
      AND language_code = ${missingLang}
    )`);
  }

  if (search) {
    conditions.push(like(destinations.slug, `%${search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count with filters
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(destinations);

  if (whereClause) {
    countQuery.where(whereClause);
  }

  const [{ count }] = await countQuery;

  // Get data with filters
  const dataQuery = db
    .select({
      id: destinations.id,
      slug: destinations.slug,
      name: destinations.name,
      thumbnail: destinations.thumbnail,
      isPublished: destinations.isPublished,
      aiGenStatus: destinations.aiGenStatus,
      region: destinations.region,
      category: destinations.category,
      names: sql`GROUP_CONCAT(${destinationTranslations.languageCode} || ':' || ${destinationTranslations.title}, ' | ')`,
    })
    .from(destinations)
    .leftJoin(
      destinationTranslations,
      eq(destinations.id, destinationTranslations.destinationId)
    );

  if (whereClause) {
    dataQuery.where(whereClause);
  }

  const rows = await dataQuery
    .groupBy(destinations.id)
    .orderBy(desc(destinations.createdAt))
    .limit(limit)
    .offset(offset);

  const data = rows.map((r) => ({
    ...r,
    names: r.names ? r.names.toString() : "",
  }));

  return {
    data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
});
