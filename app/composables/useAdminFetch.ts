const handleResponseError =
  (name: string, baseUrl: string) => async (error: any) => {
    const router = useRouter();
    console.log(`Error in ${name}`, error);
    if (error?.response?.status === 401) {
      // Try to refresh token
      try {
        await $fetch("/api/auth/refresh", {
          method: "POST",
          baseURL: baseUrl,
          credentials: "include",
        });
      } catch (refreshError) {
        console.log(`Refresh error in ${name}`, refreshError);
        router.push("/admin/login");
      }
    } else {
      throw error;
    }
  };

export const useAdminFetch = <T = any>(url: string, options: any = {}) => {
  const baseUrl = useRuntimeConfig().public.apiUrl;
  return useFetch<T>(url, {
    retry: 1,
    retryStatusCodes: [401],
    baseURL: baseUrl,
    onResponseError: handleResponseError("useAdminFetch", baseUrl),
    credentials: "include",
    ...options,
  });
};

export const adminFetch = async <T = any>(url: string, options: any = {}) => {
  const baseUrl = useRuntimeConfig().public.apiUrl;
  return $fetch<T>(url, {
    retry: 1,
    onResponseError: handleResponseError("adminFetch", baseUrl),
    baseURL: baseUrl,
    credentials: "include",
    ...options,
  });
};
