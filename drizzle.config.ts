import { defineConfig } from "drizzle-kit";
import * as path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

let localDbPath;

if (process.env.TARGET === "local") {
  // find sqlite db file in .wrangler/state/v3/d1/miniflare-D1DatabaseObject
  const dir = path.join(
    process.cwd(),
    ".wrangler",
    "state",
    "v3",
    "d1",
    "miniflare-D1DatabaseObject"
  );

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    const sqliteFile = files.find((file) => file.endsWith(".sqlite"));
    if (sqliteFile) {
      localDbPath = path.join(dir, sqliteFile);
    }
  }
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  ...(localDbPath
    ? {
        dbCredentials: {
          url: localDbPath,
        },
      }
    : {
        driver: "d1-http",
        dbCredentials: {
          accountId: "10d9b9cb0a45ac2a84aef9ec7eda601b",
          databaseId: "5247e97b-d6aa-46e2-8f45-338c6ef09275",
          token: process.env.CLOUDFLARE_API_TOKEN,
        },
      }),
});
