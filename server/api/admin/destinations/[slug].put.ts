import { eq, and } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const body = await readBody(event);
  const db = useDb(event);

  if (!slug) throw createError({ statusCode: 400, message: "Missing slug" });

  // 1. Update main info
  const dest = await db.query.destinations.findFirst({
    where: eq(destinations.slug, slug),
  });

  if (!dest)
    throw createError({ statusCode: 404, message: "Destination not found" });

  await db
    .update(destinations)
    .set({
      region: body.info.region,
      province: body.info.province,
      category: body.info.category,
      moodTags: body.info.moodTags,
      sourceUrls: body.info.sourceUrls,
      isPublished: body.info.isPublished,
      thumbnail: body.info.thumbnail,
      coverImage: body.info.coverImage,
      audioUrl: body.info.audioUrl,
    })
    .where(eq(destinations.id, dest.id));

  // 2. Update/Insert translations
  const langs = ["vi", "en"];
  for (const lang of langs) {
    const t = body.translations[lang];
    if (t) {
      await db
        .insert(destinationTranslations)
        .values({
          destinationId: dest.id,
          languageCode: lang,
          title: t.title,
          shortDesc: t.shortDesc,
          longDesc: t.longDesc,
          detailJson: t.detailJson || {},
        })
        .onConflictDoUpdate({
          target: [
            destinationTranslations.destinationId,
            destinationTranslations.languageCode,
          ],
          set: {
            title: t.title,
            shortDesc: t.shortDesc,
            longDesc: t.longDesc,
            detailJson: t.detailJson,
          },
        });
    }
  }

  return { success: true };
});
