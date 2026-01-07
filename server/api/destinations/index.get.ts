import { eq } from "drizzle-orm";
import { destinations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const db = useDb(event);

  const rows = await db
    .select({
      id: destinations.id,
      slug: destinations.slug,
      region: destinations.region,
      category: destinations.category,
      thumbnail: destinations.thumbnail,
    })
    .from(destinations)
    .where(eq(destinations.isPublished, true));

  return rows;
});
