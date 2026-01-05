import { MOOD_TAGS } from "../shared/constants/moods";
import { PROVINCES } from "../shared/constants/provinces";
import { CATEGORIES } from "../shared/constants/categories";

const allowedMoods = MOOD_TAGS.map((m) => `"${m.key}"`).join(", ");
const allowedProvinces = PROVINCES.map((p) => `"${p}"`).join(", ");
const allowedCategories = CATEGORIES.map((c) => `"${c.key}"`).join(", ");

const prompt = `
You are an expert travel data assistant for Vietnam Canvas.
Task: Create a comprehensive JSON list of significant tourist destinations in Vietnam.

CONSTRAINTS:

1. **moodTags**: You MUST select 1-3 tags strictly from this allowed list:
[${allowedMoods}]
Do not invent new tags.

2. **province**: Select strictly from this list of Vietnam 63 provinces/cities:
[${allowedProvinces}]

3. **category**: Select 1-2 categories strictly from this list:
[${allowedCategories}]

4. **sourceUrls**: strictly provide direct links to detailed articles, official pages, or wiki pages dedicated specifically to that destination. Do NOT use general "Top 10" listicles, aggregation pages, or homepage URLs. Link must be accessible publically.

5. **Output Format**: Return ONLY a valid JSON array.

[
  {
    "slug": "unique-slug-example",
    "region": "north" | "central" | "south",
    "province": "Name of Province",
    "category": ["landscape", "culture"],
    "moodTags": ["tag1", "tag2"],
    "sourceUrls": ["https://example.com/detail-article"]
  }
]
`;

import fs from "node:fs";
import path from "node:path";

// Ensure tmp directory
const tmpDir = path.resolve(process.cwd(), "tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const outputPath = path.join(tmpDir, "seed_prompt.txt");
fs.writeFileSync(outputPath, prompt.trim());

console.log(`Seed prompt written to: ${outputPath}`);
