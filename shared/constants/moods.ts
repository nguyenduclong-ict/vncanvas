export type MoodTag = {
  name: string;
  key: string;
};

export const MOOD_TAGS_DATA: Record<string, MoodTag[]> = {
  vi: [
    { name: "Yên bình", key: "peaceful" },
    { name: "Phiêu lưu", key: "adventure" },
    { name: "Văn hóa", key: "culture" },
    { name: "Lịch sử", key: "history" },
    { name: "Thiên nhiên", key: "nature" },
    { name: "Ẩm thực", key: "cuisine" },
    { name: "Tâm linh", key: "spiritual" },
    { name: "Lãng mạn", key: "romantic" },
    { name: "Gia đình", key: "family" },
    { name: "Sang trọng", key: "luxury" },
    { name: "Tiết kiệm", key: "budget" },
    { name: "Biển đảo", key: "beach" },
    { name: "Núi rừng", key: "mountain" },
    { name: "Thành phố", key: "city" },
    { name: "Sôi động", key: "nightlife" },
    { name: "Mua sắm", key: "shopping" },
  ],
  en: [
    { name: "Peaceful", key: "peaceful" },
    { name: "Adventure", key: "adventure" },
    { name: "Culture", key: "culture" },
    { name: "History", key: "history" },
    { name: "Nature", key: "nature" },
    { name: "Cuisine", key: "cuisine" },
    { name: "Spiritual", key: "spiritual" },
    { name: "Romantic", key: "romantic" },
    { name: "Family", key: "family" },
    { name: "Luxury", key: "luxury" },
    { name: "Budget", key: "budget" },
    { name: "Beach", key: "beach" },
    { name: "Mountain", key: "mountain" },
    { name: "City", key: "city" },
    { name: "Nightlife", key: "nightlife" },
    { name: "Shopping", key: "shopping" },
  ],
};

export const getMoodTags = (locale: string): MoodTag[] => {
  return (MOOD_TAGS_DATA as any)[locale] || MOOD_TAGS_DATA.vi;
};
