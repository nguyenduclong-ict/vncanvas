// https://nuxt.com/docs/api/configuration/nuxt-config
// Routes are generated dynamically by server/plugins/prerender-routes.ts from database

export default defineNuxtConfig({
  compatibilityDate: new Date().toISOString().split("T")[0] as any,
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/i18n",
    "@vueuse/nuxt",
    "@nuxtjs/seo",
    "./modules/prerender-routes",
  ],

  // SEO Configuration
  site: {
    url: "https://vietnamcanvas.com",
    name: "Vietnam Canvas",
    description:
      "Khám phá vẻ đẹp Việt Nam - Discover the beauty of Vietnam through stunning destinations, culture, and experiences.",
    defaultLocale: "vi",
  },

  seo: {
    fallbackTitle: false,
  },

  ogImage: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  i18n: {
    strategy: "prefix_except_default",
    defaultLocale: "vi",
    locales: [
      { code: "vi", iso: "vi-VN", name: "Tiếng Việt", file: "vi.json" },
      { code: "en", iso: "en-US", name: "English", file: "en.json" },
    ],
    langDir: "locales",
    detectBrowserLanguage: false,
  },

  routeRules: {
    "/admin/**": { ssr: false, prerender: false },
  },

  nitro: {
    preset: "cloudflare-pages",
    prerender: {
      crawlLinks: true,
      autoSubfolderIndex: false,
      // Routes are generated dynamically by server/plugins/prerender-routes.ts
      // which queries the database for destinations and regions
    },
  },
});
