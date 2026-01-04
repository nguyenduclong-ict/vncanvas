// Composable to fetch app data from API
// All data comes from server API endpoints

export interface Destination {
  id: number;
  slug: string;
  title: string;
  region: "north" | "central" | "south";
  category: string;
  short_desc: string;
  long_desc?: string;
  thumbnail: string;
  cover_image?: string;
  mood_tags?: string[];
  detail_json?: {
    bestTime?: string;
    transport?: string;
    tips?: string;
    story?: Array<{ text: string; img: string }>;
  };
}

export interface RegionInfo {
  name: string;
  slogan: string;
  description: string;
  features: Array<{
    icon: string;
    title: string;
    text: string;
  }>;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

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
