import { desc, eq, sql } from "drizzle-orm";
import { apiKeys } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const db = useDb(event);

  if (event.method === "GET") {
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(apiKeys);

    const rows = await db
      .select()
      .from(apiKeys)
      .orderBy(desc(apiKeys.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  if (event.method === "POST") {
    const body = await readBody(event);
    if (!body.key)
      throw createError({ statusCode: 400, message: "Keys are required" });

    // Split by newline or comma
    const rawKeys = body.key
      .split(/[\n,]+/)
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0);

    if (rawKeys.length === 0) return { count: 0 };

    let addedCount = 0;

    // Check existing keys to avoid duplicates (could also use schema unique constraint)
    const existing = await db.select({ key: apiKeys.key }).from(apiKeys);
    const existingSet = new Set(existing.map((e) => e.key));

    for (const k of rawKeys) {
      if (existingSet.has(k)) continue;

      await db.insert(apiKeys).values({
        key: k,
        provider: "gemini",
        isActive: true,
      });
      existingSet.add(k); // Prevent duplicates within the same batch
      addedCount++;
    }

    return { success: true, count: addedCount };
  }
});
