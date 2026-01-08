import {
  createAccessToken,
  createRefreshToken,
  verifyToken,
} from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const refreshToken = cookies.refresh_token;

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      message: "No refresh token",
    });
  }

  const payload = await verifyToken(refreshToken);

  if (!payload || payload.type !== "refresh") {
    throw createError({
      statusCode: 401,
      message: "Invalid refresh token",
    });
  }

  // Create new tokens (rotate refresh token for security)
  const user = {
    id: payload.id as number,
    username: payload.username as string,
  };

  const newAccessToken = await createAccessToken(user);
  const newRefreshToken = await createRefreshToken(user);

  // Set cookies
  const isProd = process.env.NODE_ENV === "production";

  setCookie(event, "access_token", newAccessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60, // 15 minutes
  });

  setCookie(event, "refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return { success: true };
});
