import { eq } from "drizzle-orm";
import { apiKeys } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const db = useDb(event);
  if (!id) throw createError({ statusCode: 400, message: "ID required" });

  if (event.method === "DELETE") {
    await db.delete(apiKeys).where(eq(apiKeys.id, parseInt(id)));
    return { success: true };
  }

  if (event.method === "PUT") {
    const body = await readBody(event);
    await db
      .update(apiKeys)
      .set({ isActive: body.isActive })
      .where(eq(apiKeys.id, parseInt(id)));
    return { success: true };
  }
});
