import { getCategories } from "~~/shared/constants/categories";
import { getRegions } from "~~/shared/constants/regions";

export const getCategoryLabel = (category: string | string[]) => {
  const { locale } = useI18n();
  const categories = getCategories(locale.value);
  const keys = Array.isArray(category) ? category : [category];
  return keys
    .map((key) => {
      const cat = categories.find((c) => c.key === key);
      return cat?.name || key;
    })
    .join(", ");
};

export const getRegionLabel = (region: string) => {
  const { locale } = useI18n();
  return getRegions(locale.value).find((r) => r.key === region)?.name;
};
