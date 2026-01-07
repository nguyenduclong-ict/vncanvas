interface User {
  id: number;
  username: string;
}

export const useAuth = () => {
  const user = useState<User | null>("user", () => null);
  const { public: config } = useRuntimeConfig();

  const fetchUser = async () => {
    try {
      const { data, error } = await useAdminFetch("/api/auth/me");
      if (data.value) {
        user.value = data.value as User;
      }
      if (error.value) {
        user.value = null;
        throw error.value;
      }
    } catch (e) {
      user.value = null;
      throw e;
    }
  };

  const logout = async () => {
    await $fetch("/api/auth/logout", {
      method: "POST",
      baseURL: config.apiUrl,
    });
    user.value = null;
    navigateTo("/admin/login");
  };

  return {
    user,
    fetchUser,
    logout,
  };
};
