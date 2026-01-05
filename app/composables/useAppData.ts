// Composable to fetch app data from API
// All data comes from server API endpoints

import type { Destination, RegionInfo, Category } from "~~/shared/types";

export const useDestinations = () => {
  const { locale } = useI18n();
  return useFetch<Destination[]>("/api/destinations", {
    query: {
      lang: locale,
    },
    watch: [locale],
  });
};

export const useDestination = (slug: string | Ref<string>) => {
  const { locale } = useI18n();
  const slugValue = isRef(slug) ? slug : ref(slug);

  return useFetch<Destination>(() => `/api/destinations/${slugValue.value}`, {
    query: {
      lang: locale,
    },
    watch: [locale], // Refetch when locale changes
  });
};

export const useRegions = () => {
  const { locale } = useI18n();
  return useFetch<Record<string, RegionInfo>>("/api/regions", {
    query: {
      lang: locale,
    },
    watch: [locale],
  });
};

export const useCategories = () => {
  return useFetch<Category[]>("/api/categories");
};

// Legacy composable for backward compatibility
// Will be removed after all pages are updated
export const useAppData = () => {
  const { data: destinations } = useDestinations();
  const { data: regions } = useRegions();
  const { data: categories } = useCategories();

  return {
    destinations: destinations.value || [],
    regionInfo: regions.value || {},
    categories: categories.value || [],
  };
};
