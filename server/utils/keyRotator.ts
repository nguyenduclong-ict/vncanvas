import { apiKeys } from "~~/db/schema";
import { eq, sql } from "drizzle-orm";

// Singleton state
let keys: string[] = [];
// We might want to store more info, but for now just keys string[] sorted by priority

export const initKeys = async (db: any) => {
  // Always fetch fresh keys to ensure rotation based on usage
  try {
    const rows = await db
      .select({ key: apiKeys.key })
      .from(apiKeys)
      .where(eq(apiKeys.isActive, true))
      .orderBy(apiKeys.lastUsedAt); // ASC: nulls (never used) or oldest used first

    keys = rows.map((r: any) => r.key);
  } catch (error) {
    console.warn("Failed to fetch keys from DB:", error);
    keys = [];
  }

  if (keys.length === 0) {
    console.warn("No Gemini API Keys found in DB");
  } else {
    // console.log(`Loaded ${keys.length} Gemini API keys.`);
  }
};

export const getNextGeminiKey = async (db: any) => {
  await initKeys(db); // Fetch fresh sorted list
  if (keys.length === 0) throw new Error("No Gemini API Keys available");

  // Return the first key (Least Recently Used)
  return keys[0];
};

export const updateKeyUsage = async (db: any, key: string) => {
  try {
    await db
      .update(apiKeys)
      .set({
        usageCount: sql`${apiKeys.usageCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(apiKeys.key, key));
  } catch (e) {
    console.error("Failed to update key usage:", e);
  }
};
