export default defineEventHandler((event) => {
  deleteCookie(event, "access_token");
  deleteCookie(event, "refresh_token");
  deleteCookie(event, "is_logged_in");

  return { success: true };
});
