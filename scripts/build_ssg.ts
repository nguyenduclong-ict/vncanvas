import { spawn, execSync, ChildProcessWithoutNullStreams } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.prod" });

export default async function buildSSG() {
  const spawns: ChildProcessWithoutNullStreams[] = [];
  process.env.BUILD_TARGET = "static";

  if (!process.env.NUXT_PUBLIC_API_URL) {
    // Build api
    execSync("npm run build:api", { stdio: "inherit" });
    // start api
    await new Promise<void>((resolve) => {
      const devApi = spawn("npm", ["run", "dev:api"]);

      spawns.push(devApi);

      devApi.stdout.on("data", (data) => {
        if (data?.toString()?.includes("http://")) {
          process.env.NUXT_PUBLIC_API_URL =
            "http://" + data.toString().match(/http:\/\/(.*)/)?.[1];

          console.log(
            "Started API server at:",
            process.env.NUXT_PUBLIC_API_URL
          );
          resolve();
        }
      });
    });
  }

  execSync("npm run generate", { stdio: "inherit" });
  spawns.forEach((spawn) => {
    spawn.kill();
  });
}

buildSSG();
