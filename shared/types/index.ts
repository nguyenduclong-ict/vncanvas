export interface Destination {
  id: number;
  slug: string;
  title: string;
  region: "north" | "central" | "south";
  province?: string;
  category: string;
  shortDesc: string;
  longDesc?: string;
  thumbnail: string;
  coverImage?: string;
  audioUrl?: string;
  moodTags?: string[];
  detailJson?: {
    bestTime?: string;
    transport?: string;
    tips?: string;
    sections?: Array<{ type: string; content: string; image?: string }>;
  };
  createdAt?: string;
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
