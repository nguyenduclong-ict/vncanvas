export const useAdminFetch = <T = any>(url: string, options: any = {}) => {
  const config = useRuntimeConfig();
  const router = useRouter();

  const defaults = {
    retry: 1,
    onResponseError: async ({ response }: any) => {
      if (response.status === 401) {
        // Try to refresh token
        try {
          await $fetch("/api/auth/refresh", {
            method: "POST",
            baseURL: config.public.apiUrl
              ? String(config.public.apiUrl)
              : undefined,
          });
        } catch (refreshError) {
          router.push("/admin/login");
        }
      }
    },
  };

  // Merge options
  const params = {
    ...defaults,
    ...options,
    // Ensure we don't overwrite headers if we need to merge them later
  };

  return useFetch<T>(url, params);
};

export const adminFetch = async <T = any>(url: string, options: any = {}) => {
  const config = useRuntimeConfig();

  const router = useRouter();

  return $fetch<T>(url, {
    retry: 1,
    onRequestError: async ({ response }: any) => {
      if (response?.status === 401) {
        try {
          await $fetch("/api/auth/refresh", {
            method: "POST",
            baseURL: config.public.apiUrl
              ? String(config.public.apiUrl)
              : undefined,
          });
        } catch (refreshError) {
          if (router) router.push("/admin/login");
        }
      }
    },
    ...options,
  });
};
