import { eq } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const db = useDb(event);

  if (!slug) throw createError({ statusCode: 400, message: "Missing slug" });

  const dest = await db.query.destinations.findFirst({
    where: eq(destinations.slug, slug),
  });

  if (!dest)
    throw createError({ statusCode: 404, message: "Destination not found" });

  const translations = await db.query.destinationTranslations.findMany({
    where: eq(destinationTranslations.destinationId, dest.id),
  });

  // Map translations to object by language code
  const transMap: Record<string, any> = {};
  translations.forEach((t) => {
    transMap[t.languageCode] = t;
  });

  return {
    info: dest,
    translations: transMap,
  };
});
