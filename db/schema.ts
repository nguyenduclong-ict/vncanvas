import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Destinations table schema (Shared data + Unified Slug)
export const destinations = sqliteTable("destinations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(), // Unified Slug
  region: text("region").notNull(),
  province: text("province"),
  category: text("category").notNull(),
  moodTags: text("mood_tags"),
  thumbnail: text("thumbnail"),
  coverImage: text("cover_image"),
  audioUrl: text("audio_url"),
  createdAt: text("created_at"),
});

// Destination Translations table schema (Localized data only)
export const destinationTranslations = sqliteTable(
  "destination_translations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    destinationId: integer("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    languageCode: text("language_code").notNull(), // 'vi', 'en', etc.

    // Localized Content
    title: text("title").notNull(),
    shortDesc: text("short_desc"),
    longDesc: text("long_desc"),
    detailJson: text("detail_json"),
  },
  (table) => ({
    uniqueLang: uniqueIndex("dest_lang_idx").on(
      table.destinationId,
      table.languageCode
    ),
  })
);

// Type exports
export type Destination = typeof destinations.$inferSelect;
export type NewDestination = typeof destinations.$inferInsert;
