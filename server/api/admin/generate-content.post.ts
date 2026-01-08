import { eq, inArray } from "drizzle-orm";
import { destinations } from "~~/db/schema";
import { addJobToQueue } from "~~/server/utils/queue";
// import {
//   addToQueue,
//   getQueueStatus,
//   getItemStatus,
//   startProcessor,
// } from "../../utils/aiQueue";

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
    };
  }

  // Add to queue via addJobToQueue
  const added: string[] = [];

  for (const s of slugsToAdd) {
    // Basic deduplication could be done here or relied on DB constraints?
    // addJobToQueue doesn't enforce uniqueness unless we check.
    // But user asked for simple skipped logic.
    await addJobToQueue(event, "ai-queue", { slug: s });
    added.push(s);
  }

  // Mark status as queued in DB immediately?
  // The consumer sets it to processing.
  // We can set it to "queued" if we want, but destinations table schema might not have "queued".
  // Assuming "aiGenStatus" supports it.
  if (added.length > 0) {
    try {
      await db
        .update(destinations)
        .set({ aiGenStatus: "queued" })
        .where(inArray(destinations.slug, added));
    } catch (e) {
      console.error("Failed to mark initial queued status", e);
    }
  }

  return {
    success: true,
    message: `Added ${added.length} destination(s) to queue`,
    added,
    skipped: slugsToAdd.length - added.length,
  };
});
