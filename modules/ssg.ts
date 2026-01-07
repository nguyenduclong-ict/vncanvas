// Nuxt module for generating prerender routes from database
// This runs at build time and adds routes dynamically

import { defineNuxtModule } from "@nuxt/kit";
import { execSync } from "node:child_process";

export default defineNuxtModule({
  meta: {
    name: "ssg",
    configKey: "ssg",
  },
  async setup(_options, nuxt) {
    if (process.env.BUILD_TARGET !== "static") return;

    // Get i18n config
    const i18nConfig = nuxt.options.i18n as any;

    const locales = i18nConfig?.locales?.map((l: any) => l.code) || [
      "vi",
      "en",
    ];
    const defaultLocale = i18nConfig?.defaultLocale || "vi";

    // Static routes
    const staticRoutes = [
      "/",
      "/tim-kiem",
      "/ve-chung-toi",
      "/lien-he",
      "/chinh-sach",
    ];

    // Region routes
    const regions = await fetch(
      `${process.env.NUXT_PUBLIC_API_URL}/api/regions`
    )
      .then((res) => res.json())
      .then((res) => Object.keys(res));

    // Get published destinations from database via Wrangler CLI

    const destinationSlugs = await fetch(
      `${process.env.NUXT_PUBLIC_API_URL}/api/destinations`
    )
      .then((res) => res.json())
      .then((res) => res.map((r: any) => r.slug));

    if (destinationSlugs.length === 0) {
      console.warn(
        "[Prerender Routes] No published destinations found or database not accessible."
      );
    }

    // Generate routes for all locales
    const routes: string[] = [];

    for (const locale of locales) {
      const localePrefix = locale === defaultLocale ? "" : `/${locale}`;

      // Add static routes
      for (const route of staticRoutes) {
        routes.push(`${localePrefix}${route}`);
      }

      // Add region routes
      for (const region of regions) {
        routes.push(`${localePrefix}/mien/${region}`);
      }

      // Add destination routes
      for (const slug of destinationSlugs) {
        routes.push(`${localePrefix}/dia-diem/${slug}`);
      }
    }

    // Add routes to Nitro prerender config
    nuxt.options.nitro = nuxt.options.nitro || {};
    nuxt.options.nitro.prerender = nuxt.options.nitro.prerender || {};
    nuxt.options.nitro.prerender.routes = [
      ...(nuxt.options.nitro.prerender.routes || []),
      ...routes,
    ];

    console.log(
      `[Prerender Routes] Generated ${routes.length} routes for ${locales.length} locales`
    );
  },
});
