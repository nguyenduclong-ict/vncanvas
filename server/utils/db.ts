import type { H3Event } from "h3";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~~/db/schema";

// Create Drizzle instance from D1 binding
export function useDb(event: H3Event) {
  const d1 = event.context.cloudflare?.env?.DB;

  if (!d1) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database connection not available",
    });
  }

  return drizzle(d1, { schema });
}
