import { eq, and } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const body = await readBody(event);
  const db = useDb(event);

  if (!slug) throw createError({ statusCode: 400, message: "Missing slug" });

  // 1. Find destination
  const dest = await db.query.destinations.findFirst({
    where: eq(destinations.slug, slug),
  });

  if (!dest)
    throw createError({ statusCode: 404, message: "Destination not found" });

  // 2. Save destination info to draft field (not directly to published fields)
  const infoDraft = {
    name: body.info.name,
    region: body.info.region,
    province: body.info.province,
    category: body.info.category,
    moodTags: body.info.moodTags,
    sourceUrls: body.info.sourceUrls,
    thumbnail: body.info.thumbnail,
    coverImage: body.info.coverImage,
    audioUrl: body.info.audioUrl,
  };

  await db
    .update(destinations)
    .set({
      draft: infoDraft,
      // Still allow isPublished toggle to update directly (it's a status, not content)
      isPublished: body.info.isPublished,
    })
    .where(eq(destinations.id, dest.id));

  // 3. Save translations to draft field
  const langs = ["vi", "en"];
  for (const lang of langs) {
    const t = body.translations[lang];
    if (t) {
      const translationDraft = {
        title: t.title,
        shortDesc: t.shortDesc,
        longDesc: t.longDesc,
        detailJson: t.detailJson || {},
      };

      // Check if translation exists
      const existingTrans = await db.query.destinationTranslations.findFirst({
        where: and(
          eq(destinationTranslations.destinationId, dest.id),
          eq(destinationTranslations.languageCode, lang)
        ),
      });

      if (existingTrans) {
        // Update existing translation's draft
        await db
          .update(destinationTranslations)
          .set({ draft: translationDraft })
          .where(eq(destinationTranslations.id, existingTrans.id));
      } else {
        // Create new translation with draft data
        await db.insert(destinationTranslations).values({
          destinationId: dest.id,
          languageCode: lang,
          title: t.title, // Required field, use draft value
          draft: translationDraft,
        });
      }
    }
  }

  return { success: true, message: "Saved to draft" };
});
