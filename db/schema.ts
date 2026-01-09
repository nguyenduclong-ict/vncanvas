import { sql } from "drizzle-orm";
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
  name: text("name"), // Display name (usually Vietnamese title)
  region: text("region").notNull(),
  province: text("province"),
  category: text("category", { mode: "json" }).$type<string[]>().notNull(), // JSON array of strings
  moodTags: text("mood_tags", { mode: "json" }).$type<string[]>(),
  thumbnail: text("thumbnail"),
  coverImage: text("cover_image"),
  audioUrl: text("audio_url"),
  isPublished: integer("is_published", { mode: "boolean" })
    .default(false)
    .notNull(),
  sourceUrls: text("source_urls", { mode: "json" }).$type<string[]>(), // JSON array of strings
  aiGenStatus: text("ai_gen_status"), // 'processing', 'done', 'error'
  draft: text("draft", { mode: "json" }).$type<{
    name?: string;
    region?: string;
    province?: string;
    category?: string[];
    moodTags?: string[];
    thumbnail?: string;
    coverImage?: string;
    audioUrl?: string;
    sourceUrls?: string[];
  }>(),
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
    detailJson: text("detail_json", { mode: "json" }).$type<any>(),
    draft: text("draft", { mode: "json" }).$type<{
      title?: string;
      shortDesc?: string;
      longDesc?: string;
      detailJson?: any;
    }>(),
  },
  (table) => ({
    uniqueLang: uniqueIndex("dest_lang_idx").on(
      table.destinationId,
      table.languageCode
    ),
  })
);

// API Keys table schema
export const apiKeys = sqliteTable("api_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull(),
  provider: text("provider").default("gemini").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Admin Users table schema
export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Hashed
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Queue Jobs table schema
export const jobs = sqliteTable(
  "jobs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    queue: text("queue").notNull(),
    data: text("data", { mode: "json" }).$type<any>().notNull(),
    status: text("status", { enum: ["pending", "running"] })
      .default("pending")
      .notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    // Index for efficient queue processing (finding pending jobs by queue)
    queueStatusIdx: uniqueIndex("jobs_queue_status_created_idx").on(
      table.queue,
      table.status,
      table.createdAt
    ),
  })
);

// Queue Settings table schema
export const queueSettings = sqliteTable("queue_settings", {
  queue: text("queue").primaryKey(),
  concurrency: integer("concurrency").default(1).notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Type exports
export type Destination = typeof destinations.$inferSelect;
export type NewDestination = typeof destinations.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type QueueSetting = typeof queueSettings.$inferSelect;
export type NewQueueSetting = typeof queueSettings.$inferInsert;
