export const useAdminFetch = <T = any>(url: string, options: any = {}) => {
  const config = useRuntimeConfig();
  const router = useRouter();

  const defaults = {
    retry: 1,
    baseURL: config.public.apiUrl,
    onResponseError: async (error: any) => {
      console.log("useAdminFetch -> onRequestError", error);
      if (error?.response?.status === 401) {
        // Try to refresh token
        try {
          await $fetch("/api/auth/refresh", {
            method: "POST",
            baseURL: config.public.apiUrl,
          });
        } catch (refreshError) {
          router.push("/admin/login");
        }
      } else {
        throw error;
      }
    },
  };

  // Merge options
  const params = {
    ...defaults,
    ...options,
  };

  return useFetch<T>(url, params);
};

export const adminFetch = async <T = any>(url: string, options: any = {}) => {
  const config = useRuntimeConfig();

  const router = useRouter();

  return $fetch<T>(url, {
    retry: 1,
    onResponseError: async (error) => {
      console.log("adminFetch -> onRequestError", error);
      if (error?.response?.status === 401) {
        try {
          console.log("adminFetch -> onRequestError -> refresh token");
          await $fetch("/api/auth/refresh", {
            method: "POST",
            baseURL: config.public.apiUrl,
          });
        } catch (refreshError) {
          console.log(
            "adminFetch -> onRequestError -> refresh token error",
            refreshError
          );
          if (router) router.push("/admin/login");
        }
      } else {
        throw error;
      }
    },
    baseURL: config.public.apiUrl,
    ...options,
  });
};
