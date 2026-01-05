export interface Destination {
  id: number;
  slug: string; // Unified slug
  region: "north" | "central" | "south";
  province?: string;
  category: string[];
  moodTags?: string[]; // Shared now
  audioUrl?: string; // Shared now
  isPublished: boolean;
  sourceUrls?: string[]; // JSON array
  thumbnail: string;
  coverImage?: string;
  createdAt?: string;

  // Localized fields (Merged from translation)
  languageCode: string; // The language of the content below
  title: string;
  shortDesc: string;
  longDesc?: string;
  detailJson?: {
    bestTime?: string;
    transport?: string;
    tips?: string;
    sections?: Array<{ type: string; content: string; image?: string }>;
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
  key: string;
  label: { vi: string; en: string };
  icon: string;
}
