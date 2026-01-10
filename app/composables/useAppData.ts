// Composable to fetch app data from API
// All data comes from server API endpoints

import type { Destination } from "~~/shared/types";

export const useDestinations = (
  options: { region?: string | Ref<string>; limit?: number } = {}
) => {
  const { locale } = useI18n();
  return useFetch("/api/search", {
    baseURL: useRuntimeConfig().public.apiUrl || undefined,
    query: {
      lang: locale.value,
      region: options.region,
      limit: options.limit,
    },
  });
};

export const useDestination = (slug: string | Ref<string>) => {
  const slugValue = isRef(slug) ? unref(slug) : slug;
  const { locale } = useI18n();

  return useFetch<Destination>(`/api/destinations/${slugValue}`, {
    baseURL: useRuntimeConfig().public.apiUrl || undefined,
    query: {
      lang: locale.value,
    },
  });
};
