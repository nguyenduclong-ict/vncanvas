import { compareSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import { adminUsers } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: "Username and password required",
    });
  }

  const db = useDb(event);
  const user = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.username, username),
  });

  if (!user) {
    throw createError({ statusCode: 401, message: "Invalid credentials" });
  }

  const isValid = compareSync(password, user.password);
  if (!isValid) {
    throw createError({ statusCode: 401, message: "Invalid credentials" });
  }

  // Set Cookie
  setCookie(event, "auth_token", user.id.toString(), {
    httpOnly: false, // Allow JS access for simple expiration check if needed, strictly should be true
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });

  return { success: true };
});
