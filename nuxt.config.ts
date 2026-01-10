// https://nuxt.com/docs/api/configuration/nuxt-config
// Routes are generated dynamically by server/plugins/prerender-routes.ts from database
import fs from "fs";

const wranglerWorker = JSON.parse(
  fs.readFileSync("wrangler.worker.json", "utf-8")
);

let config;

config = defineNuxtConfig({
  compatibilityDate: new Date().toISOString().split("T")[0] as any,
  runtimeConfig: {
    public: {
      apiUrl: "",
      assetsUrl: "",
    },
  },
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/i18n",
    "@vueuse/nuxt",
    "@nuxtjs/seo",
    "./modules/local-r2",
    "@nuxt/image",
  ],

  sitemap: {
    exclude: ["/admin/**"],
  },

  image:
    process.env.NODE_ENV === "production"
      ? {
          domains: [String(process.env.NUXT_PUBLIC_ASSET_URL || "")].filter(
            Boolean
          ),
          provider: "cloudflare",
          cloudflare: {
            baseURL: process.env.NUXT_PUBLIC_ASSET_URL,
          },
        }
      : {
          domains: ["http://localhost:3010"],
        },

  // SEO Configuration
  site: {
    url: "https://vncanvas.com",
    name: "Vietnam Canvas",
    description:
      "Khám phá vẻ đẹp Việt Nam - Discover the beauty of Vietnam through stunning destinations, culture, and experiences.",
    defaultLocale: "vi",
  },

  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
      ],
    },
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
      autoSubfolderIndex: false,
    },
  },
});

// For static build
if (process.env.BUILD_TARGET === "static") {
  config.prerender = { enabled: true };
}

// For API build
if (process.env.BUILD_TARGET === "api") {
  config = defineNuxtConfig({
    runtimeConfig: {
      private: {
        queueSecret: "",
        serverUrl: "",
        onlyApi: true,
      },
    },
    pages: false,
    modules: ["@nuxtjs/i18n"],
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
    hooks: {
      "prerender:routes": ({ routes }) => {
        routes.clear();
      },
    },
    nitro: {
      preset: "cloudflare_module",
      cloudflare: {
        nodeCompat: true,
        wrangler: wranglerWorker,
      },
    },
  });
}

export default config;
