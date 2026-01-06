export default defineNuxtRouteMiddleware((to, from) => {
  const isLoggedIn = useCookie("is_logged_in");

  if (!isLoggedIn.value && to.path !== "/admin/login") {
    return navigateTo("/admin/login");
  }
});
