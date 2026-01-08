import {
  defineEventHandler,
  setResponseHeader,
  createError,
  getRequestURL,
} from "h3";

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event);
  // Remove leading slash to get the key.
  // Example URI: /images/destinations/hanoi/thumb.jpg
  // R2 Key: images/destinations/hanoi/thumb.jpg
  const key = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  // Access the R2 binding (Assumes 'STORAGE' binding is set in wrangler.json and available in context)
  const storage = event.context.cloudflare?.env?.STORAGE;

  if (!storage) {
    // If we are here, it means the binding isn't available.
    // This might happen if not running with wrangler/platform proxy.
    // We'll log a warning and let it 404 (or maybe fall through if possible, but H3 handler usually terminates).
    console.warn("R2 Storage binding not found in event context.");
    throw createError({
      statusCode: 404,
      statusMessage: "R2 Binding Not Found",
    });
  }

  try {
    const object = await storage.get(key);
    if (!object) {
      throw createError({ statusCode: 404, statusMessage: "Image Not Found" });
    }

    setResponseHeader(
      event,
      "Content-Type",
      object.httpMetadata?.contentType || "application/octet-stream"
    );
    setResponseHeader(event, "ETag", object.httpEtag);
    setResponseHeader(event, "Cache-Control", "public, max-age=3600");

    return object.body;
  } catch (error: any) {
    console.error("Error fetching from R2:", error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
