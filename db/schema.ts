import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Destinations table schema
export const destinations = sqliteTable("destinations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  region: text("region").notNull(), // north, central, south
  province: text("province"),
  category: text("category").notNull(), // nature, culture, city, adventure, food
  moodTags: text("mood_tags"), // JSON array: ["peaceful", "majestic"]
  shortDesc: text("short_desc"),
  longDesc: text("long_desc"),
  thumbnail: text("thumbnail"),
  coverImage: text("cover_image"),
  audioUrl: text("audio_url"),
  detailJson: text("detail_json"), // JSON structure for Scrollytelling
  createdAt: text("created_at"),
});

// Type exports
export type Destination = typeof destinations.$inferSelect;
export type NewDestination = typeof destinations.$inferInsert;
