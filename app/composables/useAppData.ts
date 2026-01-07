// Composable to fetch app data from API
// All data comes from server API endpoints

import type { Destination, RegionInfo, Category } from "~~/shared/types";

export const useDestinations = (
  key: string,
  options: { region?: string | Ref<string>; limit?: number } = {}
) => {
  const { locale } = useI18n();
  return useFetch("/api/search", {
    key,
    baseURL: useRuntimeConfig().public.apiUrl || undefined,
    query: {
      lang: locale.value,
      region: options.region,
      limit: options.limit,
    },
    watch: [locale, () => unref(options.region)],
  });
};

export const useDestination = (key: string, slug: string | Ref<string>) => {
  const { locale } = useI18n();
  const slugValue = isRef(slug) ? unref(slug) : slug;

  return useFetch<Destination>(`/api/destinations/${slugValue}`, {
    key,
    baseURL: useRuntimeConfig().public.apiUrl || undefined,
    query: {
      lang: locale.value,
    },
    watch: [locale],
  });
};

export const useRegions = (key: string) => {
  const { locale } = useI18n();
  return useFetch<Record<string, RegionInfo>>("/api/regions", {
    key,
    baseURL: useRuntimeConfig().public.apiUrl || undefined,
    query: {
      lang: locale.value,
    },
    watch: [locale],
  });
};

export const useCategories = (key: string) => {
  const { locale } = useI18n();
  return useFetch<Category[]>("/api/categories", {
    key,
    baseURL: useRuntimeConfig().public.apiUrl || undefined,
    watch: [locale],
  });
};
