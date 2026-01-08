// https://nuxt.com/docs/api/configuration/nuxt-config
// Routes are generated dynamically by server/plugins/prerender-routes.ts from database
import fs from "fs";
import type { HTTPMethod } from "nuxt-security";

const wranglerWorker = JSON.parse(
  fs.readFileSync("wrangler.worker.json", "utf-8")
);

let config;

const securitySettings = {
  corsHandler: {
    origin: [
      "https://vncanvas.pages.dev",
      "https://vncanvas.com",
      "http://localhost:3000",
      "https://*.vncanvas.pages.dev",
    ],
    methods: [
      "GET",
      "HEAD",
      "PUT",
      "PATCH",
      "POST",
      "DELETE",
      "OPTIONS",
    ] as HTTPMethod[],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "Content-Range"],
    credentials: true,
  },
};

config = defineNuxtConfig({
  compatibilityDate: new Date().toISOString().split("T")[0] as any,
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
    },
  },
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/i18n",
    "@vueuse/nuxt",
    "@nuxtjs/seo",
    "nuxt-security",
  ],

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
    "api/**": {
      security: securitySettings,
    },
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
  config.modules?.push("./modules/prerender");
  config.prerender = { enabled: true };
}

// For API build
if (process.env.BUILD_TARGET === "api") {
  config = defineNuxtConfig({
    pages: false,
    modules: ["nuxt-security"],
    hooks: {
      "prerender:routes": ({ routes }) => {
        routes.clear();
      },
    },
    routeRules: {
      "api/**": {
        security: securitySettings,
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
