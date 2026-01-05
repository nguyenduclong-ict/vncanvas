export default defineNuxtRouteMiddleware((to, from) => {
  const authToken = useCookie("auth_token");

  if (!authToken.value && to.path !== "/admin/login") {
    return navigateTo("/admin/login");
  }
});
