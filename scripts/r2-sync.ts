import { spawn, exec } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load .env
dotenv.config();

const WRANGLER_SYNC_CONFIG = path.resolve("wrangler.r2-sync.json");
const WORKER_SCRIPT = "scripts/r2-sync-worker.js";
const PORT = 8787;

// CLI args
const args = process.argv.slice(2);
const diffOnly = args.includes("--diff-only");

async function main() {
  console.log(`🚀 R2 Sync: ${diffOnly ? "diff-only" : "full"} mode`);

  // 1. Validate env
  const r2S3Api = process.env.R2_S3_API;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!r2S3Api || !accessKeyId || !secretAccessKey) {
    console.error(
      "❌ Missing env vars. Required: R2_S3_API, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY"
    );
    process.exit(1);
  }

  // 2. Generate wrangler config with vars
  const baseConfig = JSON.parse(fs.readFileSync("wrangler.json", "utf-8"));
  const syncConfig = {
    name: "r2-sync",
    compatibility_date: baseConfig.compatibility_date,
    r2_buckets: baseConfig.r2_buckets,
    vars: {
      R2_S3_API: r2S3Api,
      R2_ACCESS_KEY_ID: accessKeyId,
      R2_SECRET_ACCESS_KEY: secretAccessKey,
    },
  };

  fs.writeFileSync(WRANGLER_SYNC_CONFIG, JSON.stringify(syncConfig, null, 2));
  console.log(`📝 Generated ${WRANGLER_SYNC_CONFIG}`);

  // 3. Start worker
  console.log("🔄 Starting R2 Sync Worker...");
  const worker = spawn(
    "npx",
    [
      "wrangler",
      "dev",
      WORKER_SCRIPT,
      "--local",
      "--port",
      String(PORT),
      "--config",
      WRANGLER_SYNC_CONFIG,
    ],
    { stdio: "pipe" }
  );

  let workerReady = false;

  worker.stdout?.on("data", (data) => {
    const msg = data.toString();
    if (msg.includes("Ready") || msg.includes("localhost")) {
      workerReady = true;
    }
    console.error(`[Worker]: ${msg}`);
  });

  worker.stderr?.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg.includes("Ready") || msg.includes("localhost")) {
      workerReady = true;
    }
    console.error(`[Worker]: ${msg}`);
  });

  // Wait for worker to be ready
  await waitForReady(() => workerReady, 30000);
  console.log("✅ Worker ready");

  // 4. Trigger sync
  const syncUrl = `http://localhost:${PORT}/_sync${
    diffOnly ? "?diff=true" : ""
  }`;
  console.log(`📤 Triggering sync: ${syncUrl}`);

  try {
    const res = await fetch(syncUrl);
    const text = await res.text();

    if (!res.ok) {
      console.error("❌ Worker error:", text);
    } else {
      try {
        const result = JSON.parse(text);
        console.log("\n📊 Sync Result:");
        console.log(JSON.stringify(result, null, 2));
      } catch {
        console.log("\n📊 Response:", text);
      }
    }
  } catch (e: any) {
    console.error("❌ Sync failed:", e.message);
  }

  // 5. Cleanup
  console.log("\n🧹 Cleaning up...");
  worker.kill();
  fs.unlinkSync(WRANGLER_SYNC_CONFIG);

  setTimeout(() => process.exit(0), 500);
}

async function waitForReady(
  check: () => boolean,
  timeout: number
): Promise<void> {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeout) {
      throw new Error("Timeout waiting for worker");
    }
    await new Promise((r) => setTimeout(r, 200));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
