import { eq } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const query = getQuery(event);
  const viewPublished = query.view === "published";
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

  // Check if has any draft data
  const hasDestDraft = dest.draft !== null;
  const hasTransDraft = translations.some((t) => t.draft !== null);
  const hasDraft = hasDestDraft || hasTransDraft;

  // Prepare destination info - merge draft if not viewing published
  let info: any;
  if (viewPublished || !dest.draft) {
    // Return published data only
    info = { ...dest, draft: undefined };
  } else {
    // Merge draft into published (draft overrides)
    info = {
      ...dest,
      ...dest.draft, // Draft fields override published
      draft: undefined,
    };
  }

  // Map translations to object by language code
  const transMap: Record<string, any> = {};
  translations.forEach((t) => {
    if (viewPublished || !t.draft) {
      // Return published translation only
      transMap[t.languageCode] = { ...t, draft: undefined };
    } else {
      // Merge draft into published (draft overrides)
      transMap[t.languageCode] = {
        ...t,
        ...t.draft, // Draft fields override published
        draft: undefined,
      };
    }
  });

  return {
    info,
    translations: transMap,
    hasDraft,
    viewingPublished: viewPublished,
  };
});
