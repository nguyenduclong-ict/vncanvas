import { type H3Event } from "h3";
import path from "path";

export const downloadImage = async (
  event: H3Event,
  url: string,
  folderName: string,
  customName?: string
) => {
  try {
    // 1. Process URL
    if (url.includes("upload.wikimedia.org") && url.includes("/thumb/")) {
      url = url.replace(/\/thumb\//, "/");
      const lastSlashIndex = url.lastIndexOf("/");
      url = url.substring(0, lastSlashIndex);
    }

    // 2. Fetch Image
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // 3. Determine Filename
    const finalUrl = response.url;
    let filename = "";
    if (customName) {
      let ext = path.extname(new URL(finalUrl).pathname);
      if (!ext || ext === ".") ext = ".jpg";
      filename = `${customName}${ext}`;
    } else {
      filename =
        path.basename(new URL(finalUrl).pathname) || `image-${Date.now()}.jpg`;
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {}
      if (/^\d+px-/.test(filename)) filename = filename.replace(/^\d+px-/, "");
    }
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

    // 4. Upload to R2
    const storage = event.context.cloudflare?.env?.STORAGE;
    if (!storage) {
      console.warn("Storage binding not available, skipping upload");
      return null;
    }

    // Store with 'images/' prefix to match current DB structure and public folder structure
    const key = `images/destinations/${folderName}/${cleanFilename}`;

    await storage.put(key, buffer, {
      httpMetadata: { contentType: contentType },
    });

    // Return relative path matching the DB structure
    return `/images/destinations/${folderName}/${cleanFilename}`;
  } catch (e) {
    console.error(`Failed to download image ${url}:`, e);
    return null;
  }
};

export const deleteDestinationImages = async (
  event: H3Event,
  folderName: string
) => {
  try {
    const storage = event.context.cloudflare?.env?.STORAGE;
    if (!storage) return;

    // R2 list allows listing by prefix
    const prefix = `destinations/${folderName}/`;
    const list = await storage.list({ prefix });

    if (list.objects.length > 0) {
      const keys = list.objects.map((o: any) => o.key);
      // R2 delete allows deleting multiple? SDK usage: storage.delete(keys)
      // cloudflare bindings usually take string or string[].
      await storage.delete(keys);
    }
    console.log(`Deleted images for ${folderName}`);
  } catch (e) {
    console.error(`Failed to delete images for ${folderName}:`, e);
  }
};
