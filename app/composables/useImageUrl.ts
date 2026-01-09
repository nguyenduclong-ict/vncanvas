export const useImageUrl = () => {
  const config = useRuntimeConfig();
  const assetsUrl = config.public.assetsUrl;

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    if (assetsUrl && assetsUrl.startsWith("http")) {
      // Remove leading slash from path if domain doesn't end with slash, prevent double slashes
      // But usually R2 public domain is the root.
      // If path is "/images/...", and we want "https://domain/images/..."
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      // Remove trailing slash from domain
      const cleanDomain = assetsUrl.endsWith("/")
        ? assetsUrl.slice(0, -1)
        : assetsUrl;
      return `${cleanDomain}${cleanPath}`;
    }

    // Fallback for local dev without R2 domain (served from public folder via Nuxt)
    return path;
  };

  return {
    getImageUrl,
  };
};
