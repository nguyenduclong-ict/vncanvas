import { hashSync } from "bcryptjs";
import dotenv from "dotenv";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

dotenv.config();

// Read env
const adminUserEnv = process.env.ADMIN_USER;

if (!adminUserEnv) {
  console.error("Error: ADMIN_USER environment variable is not set.");
  console.error(
    "Usage: ADMIN_USER='username|password' npx tsx scripts/create_admin.ts"
  );
  process.exit(1);
}

const [username, password] = adminUserEnv.split("|");

if (!username || !password) {
  console.error("Error: Invalid format. Expected 'username|password'.");
  process.exit(1);
}

const hashedPassword = hashSync(password, 10);

// Generate SQL
const sql = `INSERT INTO admin_users (username, password) VALUES ('${username}', '${hashedPassword}') ON CONFLICT(username) DO UPDATE SET password = '${hashedPassword}';`;

const outputPath = path.resolve(process.cwd(), "tmp/admin.sql");
fs.writeFileSync(outputPath, sql);

// Execute SQL
execSync(`wrangler d1 execute vietnam-canvas-db --local --file=${outputPath}`);

// Clean up
fs.unlinkSync(outputPath);

console.log(`Admin user created: ${username}`);
