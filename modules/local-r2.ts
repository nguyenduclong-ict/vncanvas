import { defineNuxtModule, addServerHandler, createResolver } from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "local-r2-proxy",
    configKey: "localR2",
  },
  setup(options, nuxt) {
    // Only run in development
    if (!nuxt.options.dev) return;

    console.info("Initializing Local R2 Handler...");
    const resolver = createResolver(import.meta.url);

    // Register a server handler for /images/** to intercept image requests
    // and serve them from the R2 binding (auto-injected by Nuxt/Nitro in dev).
    addServerHandler({
      route: "/images/**",
      handler: resolver.resolve("./runtime/r2-handler"),
    });

    // Ensure assetsUrl is empty so useImageUrl generates relative paths
    // causing requests to hit the server handler above.

    const host = nuxt.options.devServer.host || "localhost";
    const port = nuxt.options.devServer.port || 3000;
    const protocol = nuxt.options.devServer.https ? "https" : "http";

    const serverUrl = `${protocol}://${host}:${port}`;

    nuxt.options.runtimeConfig.public.assetsUrl = serverUrl;
  },
});
