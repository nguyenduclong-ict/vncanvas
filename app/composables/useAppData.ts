// Composable to fetch app data from API
// All data comes from server API endpoints

import type { Destination, RegionInfo, Category } from "~~/shared/types";

export type { Destination, RegionInfo, Category };

export const useDestinations = () => {
  return useFetch<Destination[]>("/api/destinations");
};

export const useDestination = (slug: string | Ref<string>) => {
  const slugValue = isRef(slug) ? slug : ref(slug);
  return useFetch<Destination>(() => `/api/destinations/${slugValue.value}`);
};

export const useRegions = () => {
  return useFetch<Record<string, RegionInfo>>("/api/regions");
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
