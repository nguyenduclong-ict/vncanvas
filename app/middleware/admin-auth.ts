export default defineNuxtRouteMiddleware(async (to, from) => {
  // If navigating to login, allow
  if (to.path === "/admin/login") return;

  const { user, fetchUser } = useAuth();

  // If user is already loaded, proceed
  if (user.value) return;

  // Try to fetch user (this will handle token refresh if needed via useAdminFetch)
  try {
    await fetchUser();
    if (!user.value) {
      return navigateTo("/admin/login");
    }
  } catch (e) {
    // return navigateTo("/admin/login");
  }
});
