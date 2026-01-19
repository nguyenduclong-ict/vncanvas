export default defineEventHandler((event) => {
  const allowedOrigins = [
    "https://vncanvas.pages.dev",
    "https://vncanvas.com",
    "http://localhost:3000",
    "http://localhost:3010",
  ];

  const origin = getRequestHeader(event, "Origin");
  // Check exact match or subdomain match
  const isAllowed = origin && allowedOrigins.includes(origin);

  if (isAllowed) {
    setResponseHeaders(event, {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods":
        "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Expose-Headers": "Content-Length, Content-Range",
    });
  }

  if (event.method === "OPTIONS") {
    return sendNoContent(event);
  }
});
