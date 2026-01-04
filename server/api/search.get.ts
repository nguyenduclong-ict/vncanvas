// Search API - query destinations from database with filters and pagination

export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB;
  const query = getQuery(event);

  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database connection not available",
    });
  }

  try {
    const keyword = (query.q as string) || "";
    const category = (query.category as string) || "all";
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 9;
    const offset = (page - 1) * limit;

    // Build base WHERE clause
    let whereClause = "WHERE 1=1";
    const params: string[] = [];

    if (keyword) {
      whereClause +=
        " AND (title LIKE ? OR short_desc LIKE ? OR long_desc LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (category && category !== "all") {
      whereClause += " AND category = ?";
      params.push(category);
    }

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM destinations ${whereClause}`;
    const countResult = await db
      .prepare(countSql)
      .bind(...params)
      .first<{ total: number }>();
    const total = countResult?.total || 0;

    // Get paginated results
    const sql = `SELECT id, slug, title, region, category, short_desc, thumbnail FROM destinations ${whereClause} ORDER BY id LIMIT ? OFFSET ?`;
    const { results } = await db
      .prepare(sql)
      .bind(...params, limit, offset)
      .all();

    return {
      data: results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Search error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to search destinations",
    });
  }
});
