DROP TABLE IF EXISTS destinations;

CREATE TABLE destinations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  region TEXT NOT NULL, -- north, central, south
  province TEXT,
  category TEXT NOT NULL, -- nature, culture, city, adventure, food
  mood_tags TEXT, -- JSON array: ["peaceful", "majestic"]
  short_desc TEXT,
  long_desc TEXT,
  thumbnail TEXT,
  cover_image TEXT,
  audio_url TEXT,
  detail_json TEXT, -- JSON structure for Scrollytelling
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster search
CREATE INDEX idx_destinations_slug ON destinations(slug);
CREATE INDEX idx_destinations_region ON destinations(region);
CREATE INDEX idx_destinations_category ON destinations(category);
