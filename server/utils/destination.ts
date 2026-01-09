import { eq } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";

export const publishDestinationChanges = async (
  db: any,
  destinationId: number
) => {
  // 1. Publish destination draft
  const dest = await db.query.destinations.findFirst({
    where: eq(destinations.id, destinationId),
  });

  if (dest && dest.draft) {
    const draftData = dest.draft as any;
    await db
      .update(destinations)
      .set({
        name: draftData.name ?? dest.name,
        region: draftData.region ?? dest.region,
        province: draftData.province ?? dest.province,
        category: draftData.category ?? dest.category,
        moodTags: draftData.moodTags ?? dest.moodTags,
        sourceUrls: draftData.sourceUrls ?? dest.sourceUrls,
        thumbnail: draftData.thumbnail ?? dest.thumbnail,
        coverImage: draftData.coverImage ?? dest.coverImage,
        audioUrl: draftData.audioUrl ?? dest.audioUrl,
        draft: null, // Clear draft after publish
      })
      .where(eq(destinations.id, destinationId));
  }

  // 2. Publish translation drafts
  const translations = await db.query.destinationTranslations.findMany({
    where: eq(destinationTranslations.destinationId, destinationId),
  });

  for (const trans of translations) {
    if (trans.draft) {
      const draftData = trans.draft as any;
      await db
        .update(destinationTranslations)
        .set({
          title: draftData.title ?? trans.title,
          shortDesc: draftData.shortDesc ?? trans.shortDesc,
          longDesc: draftData.longDesc ?? trans.longDesc,
          detailJson: draftData.detailJson ?? trans.detailJson,
          draft: null, // Clear draft after publish
        })
        .where(eq(destinationTranslations.id, trans.id));
    }
  }
};
