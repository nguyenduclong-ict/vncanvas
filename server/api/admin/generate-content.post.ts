import { eq, inArray } from "drizzle-orm";
import { destinations } from "~~/db/schema";
import {
  addToQueue,
  getQueueStatus,
  getItemStatus,
  startProcessor,
} from "../../utils/aiQueue";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { slug, slugs, ids } = body;
  const db = useDb(event);

  // Collect slugs to add
  let slugsToAdd: string[] = [];

  if (slug) {
    // Single slug mode
    const dest = await db.query.destinations.findFirst({
      where: eq(destinations.slug, slug),
      columns: { slug: true, sourceUrls: true },
    });

    if (!dest) {
      throw createError({ statusCode: 404, message: "Destination not found" });
    }

    if (!dest.sourceUrls || dest.sourceUrls.length === 0) {
      throw createError({
        statusCode: 400,
        message: "No source URLs found for this destination",
      });
    }

    slugsToAdd = [slug];
  } else if (slugs && Array.isArray(slugs)) {
    // Multiple slugs mode
    const selectedDests = await db.query.destinations.findMany({
      where: inArray(destinations.slug, slugs),
      columns: { slug: true, sourceUrls: true },
    });

    slugsToAdd = selectedDests
      .filter((d) => d.sourceUrls && d.sourceUrls.length > 0)
      .map((d) => d.slug);
  } else if (ids && Array.isArray(ids)) {
    // IDs mode
    const selectedDests = await db.query.destinations.findMany({
      where: inArray(destinations.id, ids),
      columns: { slug: true, sourceUrls: true },
    });

    slugsToAdd = selectedDests
      .filter((d) => d.sourceUrls && d.sourceUrls.length > 0)
      .map((d) => d.slug);
  } else {
    throw createError({
      statusCode: 400,
      message: "Missing slug, slugs array, or ids array",
    });
  }

  if (slugsToAdd.length === 0) {
    return {
      success: false,
      message: "No valid destinations with source URLs found",
      added: [],
      ...getQueueStatus(),
    };
  }

  // Add to queue (returns only newly added slugs)
  const added = addToQueue(slugsToAdd);

  // Mark status as processing in DB immediately for added items
  if (added.length > 0) {
    try {
      await db
        .update(destinations)
        .set({ aiGenStatus: "processing" })
        .where(inArray(destinations.slug, added));
    } catch (e) {
      console.error("Failed to mark initial processing status", e);
    }
  }

  // Start processor
  startProcessor(db);

  return {
    success: true,
    message:
      added.length > 0
        ? `Added ${added.length} destination(s) to queue`
        : "All destinations already in queue",
    added,
    skipped: slugsToAdd.length - added.length,
    ...getQueueStatus(),
  };
});
