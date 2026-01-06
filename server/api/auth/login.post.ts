import { eq } from "drizzle-orm";
import { adminUsers } from "~~/db/schema";
import {
  createAccessToken,
  createRefreshToken,
  verifyPassword,
} from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: "Username and password are required",
    });
  }

  const db = useDb(event);
  const user = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.username, username),
  });

  if (!user || !verifyPassword(password, user.password)) {
    throw createError({
      statusCode: 401,
      message: "Invalid credentials",
    });
  }

  // Create tokens
  const accessToken = await createAccessToken({
    id: user.id,
    username: user.username,
  });
  const refreshToken = await createRefreshToken({
    id: user.id,
    username: user.username,
  });

  // Set cookies
  setCookie(event, "access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 minutes
  });

  setCookie(event, "refresh_token", refreshToken, {
    httpOnly: true, // IMPORTANT: HttpOnly
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // Public cookie to let client know we are logged in
  setCookie(event, "is_logged_in", "true", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
  });

  return { success: true };
});
