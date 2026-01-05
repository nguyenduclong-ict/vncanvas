import { destinations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const db = useDb(event);

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
    .orderBy(destinations.id);

  return results;
});
