export const useImageUrl = () => {
  const config = useRuntimeConfig();
  const r2PublicDomain = config.public.r2PublicDomain as string;

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    // specific check for local images that might already include /images prefix
    // If we have an R2 domain, we want to join it.
    // Assuming R2 domain is like "https://pub-xxxx.r2.dev"
    // And path is "/images/destinations/..."

    if (r2PublicDomain && r2PublicDomain.startsWith("http")) {
      // Remove leading slash from path if domain doesn't end with slash, prevent double slashes
      // But usually R2 public domain is the root.
      // If path is "/images/...", and we want "https://domain/images/..."
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      // Remove trailing slash from domain
      const cleanDomain = r2PublicDomain.endsWith("/")
        ? r2PublicDomain.slice(0, -1)
        : r2PublicDomain;
      return `${cleanDomain}${cleanPath}`;
    }

    // Fallback for local dev without R2 domain (served from public folder via Nuxt)
    return path;
  };

  return {
    getImageUrl,
  };
};
