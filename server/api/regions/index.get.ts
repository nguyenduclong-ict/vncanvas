import { REGIONS_DATA } from "~~/shared/constants/regions";

// Regions metadata - static data since regions don't change often
// Now supports localization via ?lang=en

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const lang = (query.lang as string) || "vi";

  return REGIONS_DATA[lang] || REGIONS_DATA["vi"];
});
