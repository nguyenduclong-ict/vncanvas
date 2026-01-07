export default defineEventHandler((event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods":
      "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  // Set headers for all requests
  setResponseHeaders(event, headers);

  // Handle preflight requests
  if (event.method === "OPTIONS") {
    return "OK";
  }
});
