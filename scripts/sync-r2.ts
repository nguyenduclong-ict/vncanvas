import { execSync } from "child_process";

console.log("Syncing local images to Production R2...");
try {
  // Just run migrate-images.ts without --local flag
  execSync("npx tsx scripts/migrate-images.ts", { stdio: "inherit" });
  console.log("Sync to Prod completed.");
} catch (e) {
  console.error("Sync failed", e);
  process.exit(1);
}
