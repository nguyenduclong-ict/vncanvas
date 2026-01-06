import { promises as fs } from "fs";
import path from "path";

export const downloadImage = async (
  url: string,
  folderName: string,
  customName?: string
) => {
  try {
    // Convert Wikipedia thumbnail URLs to original high-res URLs
    if (url.includes("upload.wikimedia.org") && url.includes("/thumb/")) {
      url = url.replace(/\/thumb\//, "/");
      const lastSlashIndex = url.lastIndexOf("/");
      url = url.substring(0, lastSlashIndex);
    }

    const publicDir = path.resolve(process.cwd(), "public");
    const folderPath = path.join(
      publicDir,
      "images",
      "destinations",
      folderName
    );

    await fs.mkdir(folderPath, { recursive: true });

    // Retry logic for 429 and network errors
    const maxAttempts = 3;
    let buffer: Buffer | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          redirect: "follow", // Enable redirect following
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Use the final URL after redirects (to get correct extension)
        const finalUrl = response.url;
        let filename = "";

        // If using customName (e.g. image-1), append extension from final URL
        if (customName) {
          let ext = path.extname(new URL(finalUrl).pathname);
          if (!ext || ext === ".") ext = ".jpg";
          filename = `${customName}${ext}`;
        } else {
          // If no custom name, rebuild filename from final URL to be safe
          filename =
            path.basename(new URL(finalUrl).pathname) ||
            `image-${Date.now()}.jpg`;

          try {
            filename = decodeURIComponent(filename);
          } catch (e) {}

          if (/^\d+px-/.test(filename)) {
            filename = filename.replace(/^\d+px-/, "");
          }
        }

        // Re-clean filename with final determination
        const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

        // Convert buffer
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);

        // Define save path with final filename
        const savePath = path.join(folderPath, cleanFilename);
        const publicPath = `/images/destinations/${folderName}/${cleanFilename}`;

        await fs.writeFile(savePath, buffer);
        return publicPath;
      } catch (err: any) {
        const is429 = err.message?.includes("429");
        const isRetryable = is429 || err.message?.includes("5");

        console.warn(
          `Attempt ${attempt}/${maxAttempts} failed for ${url}: ${err.message}`
        );

        if (attempt >= maxAttempts || !isRetryable) {
          break;
        }

        // Exponential backoff: 2s, 4s, 8s
        const delay = 2000 * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    // Return null if loop finished without returning
    console.error(`Failed to download after ${maxAttempts} attempts: ${url}`);
    return null;
  } catch (e) {
    console.error(`Failed to download image ${url}:`, e);
    return null;
  }
};

export const deleteDestinationImages = async (folderName: string) => {
  try {
    const publicDir = path.resolve(process.cwd(), "public");
    const folderPath = path.join(
      publicDir,
      "images",
      "destinations",
      folderName
    );

    await fs.rm(folderPath, { recursive: true, force: true });
    console.log(`Deleted image folder: ${folderPath}`);
  } catch (e) {
    console.error(`Failed to delete images for ${folderName}:`, e);
  }
};
