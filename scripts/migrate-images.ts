import { promises as fs, statSync } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Configuration
const DESTINATIONS_DIR = path.resolve("public/images-old/destinations");
const BUCKET_NAME = "vncanvas-storage";
const CONCURRENCY_LIMIT = 8; // Number of parallel uploads

// Arguments
const args = process.argv.slice(2);
const isLocal = args.includes("--local");

interface UploadTask {
  key: string;
  filePath: string;
}

async function main() {
  console.log(
    `Starting parallel migration to ${isLocal ? "Local" : "Production"} R2...`
  );

  if (!isValidDir(DESTINATIONS_DIR)) {
    console.error(`Directory not found: ${DESTINATIONS_DIR}`);
    return;
  }

  // 1. Collect all files
  const tasks: UploadTask[] = [];
  const slugs = await fs.readdir(DESTINATIONS_DIR);

  for (const slug of slugs) {
    const slugPath = path.join(DESTINATIONS_DIR, slug);
    if (!isValidDir(slugPath)) continue;

    const files = await fs.readdir(slugPath);
    for (const file of files) {
      if (file.startsWith(".")) continue;

      const filePath = path.join(slugPath, file);
      // Key format: images/destinations/slug/filename
      const key = `images/destinations/${slug}/${file}`;
      tasks.push({ key, filePath });
    }
  }

  console.log(`Found ${tasks.length} files to upload.`);

  // 2. Process with concurrency
  const results = { success: 0, failed: 0 };

  // Chunk the tasks or use a pool
  await processInBatches(tasks, CONCURRENCY_LIMIT, async (task) => {
    try {
      // console.log(`Uploading ${task.key}...`); // Reduce log noise
      const cmd = `npx wrangler r2 object put "${BUCKET_NAME}/${
        task.key
      }" --file "${task.filePath}" ${isLocal ? "--local" : ""}`;
      await execAsync(cmd);
      process.stdout.write("."); // Progress dot
      results.success++;
    } catch (e: any) {
      console.error(`\nFailed to upload ${task.key}:`, e.message);
      results.failed++;
    }
  });

  console.log(`\nMigration completed.`);
  console.log(`Success: ${results.success}`);
  console.log(`Failed: ${results.failed}`);
}

async function processInBatches<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<void>
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(fn));
  }
}

function isValidDir(pathStr: string) {
  try {
    return statSync(pathStr).isDirectory();
  } catch (e) {
    return false;
  }
}

main().catch(console.error);
