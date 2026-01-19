import { execSync } from "child_process";
import fs from "fs";
import dotenv from "dotenv";

// Load .env
dotenv.config({ path: ".env.prod" });

const WRANGLER_CONFIG = "wrangler.worker.json";
const WRANGLER_TEMP_CONFIG = "wrangler.deploy.json";

async function main() {
  try {
    if (!fs.existsSync(WRANGLER_CONFIG)) {
      console.error(`Config file ${WRANGLER_CONFIG} not found`);
      process.exit(1);
    }

    const configContent = fs.readFileSync(WRANGLER_CONFIG, "utf-8");
    const config = JSON.parse(configContent);

    config.vars = config.vars || {};

    Object.keys(config.vars).forEach((key) => {
      if (process.env[key]) {
        config.vars[key] = process.env[key];
      }
    });

    // Write temp config
    console.log(
      `Generating temporary config ${WRANGLER_TEMP_CONFIG} with injected vars...`
    );
    fs.writeFileSync(WRANGLER_TEMP_CONFIG, JSON.stringify(config, null, 2));

    // Run deploy
    console.log("Running wrangler deploy...");
    // Inherit stdio to see output
    execSync(`wrangler --config ${WRANGLER_TEMP_CONFIG} deploy`, {
      stdio: "inherit",
    });

    console.log("Deployment successful.");
  } catch (error: any) {
    console.error("Deployment failed:", error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (fs.existsSync(WRANGLER_TEMP_CONFIG)) {
      console.log(`Cleaning up ${WRANGLER_TEMP_CONFIG}...`);
      fs.unlinkSync(WRANGLER_TEMP_CONFIG);
    }
  }
}

main();
