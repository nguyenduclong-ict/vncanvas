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

    // Ensure r2PublicDomain is empty so useImageUrl generates relative paths
    // causing requests to hit the server handler above.
    nuxt.options.runtimeConfig.public.r2PublicDomain = "";
  },
});
