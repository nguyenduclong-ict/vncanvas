import { inArray, eq } from "drizzle-orm";
import { destinations } from "~~/db/schema";
import { z } from "zod";

const bulkActionSchema = z.object({
  ids: z.array(z.number()).min(1),
  action: z.enum(["delete", "publish", "unpublish"]),
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
      await db
        .update(destinations)
        .set({ isPublished: true })
        .where(inArray(destinations.id, ids));
    } else if (action === "unpublish") {
      await db
        .update(destinations)
        .set({ isPublished: false })
        .where(inArray(destinations.id, ids));
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
