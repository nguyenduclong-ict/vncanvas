import {
  defineEventHandler,
  setResponseHeader,
  createError,
  getRequestURL,
} from "h3";

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event);
  const key = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  const storage = event.context.cloudflare?.env?.STORAGE;

  if (!storage) {
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
