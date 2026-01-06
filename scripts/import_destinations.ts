import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Interface matching the new prompt output
interface AiDestination {
  slug: string;
  name: string;
  region: "north" | "central" | "south";
  province?: string;
  category: string;
  moodTags?: string[];
  sourceUrls?: string[];
  content?: {
    vi: AiContent;
    en: AiContent;
  };
}

interface AiContent {
  title: string;
  short_desc: string;
  long_desc: string;
  best_time?: string;
  transport?: string;
  tips?: string;
}

const main = () => {
  const jsonPath = path.resolve(process.cwd(), "tmp/ai_destinations.json");

  if (!fs.existsSync(jsonPath)) {
    console.error(`File not found: ${jsonPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(jsonPath, "utf-8");
  let destinations: AiDestination[] = [];

  try {
    destinations = JSON.parse(content);
  } catch (e) {
    console.error("Invalid JSON format");
    process.exit(1);
  }

  let sqlOutput =
    "DELETE FROM sqlite_sequence WHERE name='destinations' AND 0; -- Safety no-op\n";

  const toJson = (obj: any, defaultValue = {}) =>
    JSON.stringify(obj || defaultValue).replace(/'/g, "''");

  destinations.forEach((dest) => {
    if (!dest.slug) return;

    const slug = dest.slug;
    const region = dest.region || "north";
    const province = (dest.province || "").replace(/'/g, "''");
    const category = toJson(dest.category, []);
    const moodTags = toJson(dest.moodTags, []);
    const sourceUrls = toJson(dest.sourceUrls, []);

    // Use Vietnamese title as name, fallback to English title, then slug
    const name = dest.name;

    // 1. Insert Destination
    sqlOutput += `
INSERT INTO destinations (slug, name, region, province, category, mood_tags, source_urls, is_published, created_at)
VALUES ('${slug}', '${name}', '${region}', '${province}', '${category}', '${moodTags}', '${sourceUrls}', 0, datetime('now'))
ON CONFLICT(slug) DO UPDATE SET 
name=excluded.name, region=excluded.region, province=excluded.province, category=excluded.category, mood_tags=excluded.mood_tags, source_urls=excluded.source_urls;
`;

    // 2. Insert Translations
    if (dest.content) {
      ["vi", "en"].forEach((lang) => {
        const c = dest.content![lang as "vi" | "en"];
        if (!c) return;

        const title = (c.title || slug).replace(/'/g, "''");
        const shortDesc = (c.short_desc || "").replace(/'/g, "''");
        const longDesc = (c.long_desc || "").replace(/'/g, "''");

        const detailObj = {
          bestTime: c.best_time,
          transport: c.transport,
          tips: c.tips,
        };
        const detailJson = JSON.stringify(detailObj).replace(/'/g, "''");

        sqlOutput += `
INSERT INTO destination_translations (destination_id, language_code, title, short_desc, long_desc, detail_json)
VALUES (
  (SELECT id FROM destinations WHERE slug = '${slug}'), 
  '${lang}', 
  '${title}', 
  '${shortDesc}', 
  '${longDesc}', 
  '${detailJson}'
)
ON CONFLICT(destination_id, language_code) DO UPDATE SET
title=excluded.title, short_desc=excluded.short_desc, long_desc=excluded.long_desc, detail_json=excluded.detail_json;
`;
      });
    }
  });

  const outputPath = path.resolve(process.cwd(), "tmp/ai_import.sql");
  fs.writeFileSync(outputPath, sqlOutput);
  console.log(`AI SQL generated at: ${outputPath}`);

  execSync(
    `wrangler d1 execute vietnam-canvas-db --local --file=${outputPath}`,
    {
      stdio: "pipe",
    }
  );
};

main();
