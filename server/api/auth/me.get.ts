import { verifyToken } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, "access_token");

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const payload = await verifyToken(accessToken);

  if (!payload) {
    throw createError({
      statusCode: 401,
      message: "Invalid token",
    });
  }

  return {
    id: payload.id,
    username: payload.username,
  };
});
