export type Category = {
  name: string;
  icon: string;
  key: string;
};

export const CATEGORIES_DATA: Record<string, Category[]> = {
  vi: [
    { name: "Phong cảnh", icon: "mountain", key: "landscape" },
    { name: "Văn hóa", icon: "landmark", key: "culture" },
    { name: "Ẩm thực", icon: "utensils", key: "food" },
    { name: "Lịch sử", icon: "scroll-text", key: "history" },
    { name: "Biển đảo", icon: "waves", key: "beaches" },
    { name: "Núi rừng", icon: "trees", key: "mountain" },
    { name: "Đô thị", icon: "building-2", key: "urban" },
    { name: "Tâm linh", icon: "sparkles", key: "spiritual" },
    { name: "Sinh thái", icon: "leaf", key: "eco" },
    { name: "Nghỉ dưỡng", icon: "tree-palm", key: "resort" },
  ],
  en: [
    { name: "Landscape", icon: "mountain", key: "landscape" },
    { name: "Culture", icon: "landmark", key: "culture" },
    { name: "Food", icon: "utensils", key: "food" },
    { name: "History", icon: "scroll-text", key: "history" },
    { name: "Beaches", icon: "waves", key: "beaches" },
    { name: "Mountain", icon: "trees", key: "mountain" },
    { name: "Urban", icon: "building-2", key: "urban" },
    { name: "Spiritual", icon: "sparkles", key: "spiritual" },
    { name: "Ecotourism", icon: "leaf", key: "eco" },
    { name: "Resort", icon: "tree-palm", key: "resort" },
  ],
};

export const getCategories = (locale: string): Category[] => {
  return (CATEGORIES_DATA as any)[locale];
};
