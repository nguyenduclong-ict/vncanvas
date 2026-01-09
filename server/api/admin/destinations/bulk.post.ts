import { inArray } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";
import { publishDestinationChanges } from "../../../utils/destination";
import { z } from "zod";

const bulkActionSchema = z.object({
  ids: z.array(z.number()).min(1),
  action: z.enum([
    "delete",
    "publish",
    "unpublish",
    "merge_draft",
    "reset_draft",
  ]),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validation = bulkActionSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid input",
      data: validation.error,
    });
  }

  const { ids, action } = validation.data;
  const db = useDb(event);

  try {
    if (action === "delete") {
      await db.delete(destinations).where(inArray(destinations.id, ids));
    } else if (action === "publish") {
      // Visibility only
      await db
        .update(destinations)
        .set({ isPublished: true })
        .where(inArray(destinations.id, ids));
    } else if (action === "unpublish") {
      // Visibility only
      await db
        .update(destinations)
        .set({ isPublished: false })
        .where(inArray(destinations.id, ids));
    } else if (action === "merge_draft") {
      // Merge draft changes logic using shared utility
      for (const id of ids) {
        await publishDestinationChanges(db, id);
      }
    } else if (action === "reset_draft") {
      // 1. Clear destination draft
      await db
        .update(destinations)
        .set({ draft: null })
        .where(inArray(destinations.id, ids));

      // 2. Clear translation drafts
      await db
        .update(destinationTranslations)
        .set({ draft: null })
        .where(inArray(destinationTranslations.destinationId, ids));
    }

    return { success: true };
  } catch (error) {
    console.error("Bulk action error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to perform bulk action",
    });
  }
});
