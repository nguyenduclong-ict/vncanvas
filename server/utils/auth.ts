import { compareSync, hashSync } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.NUXT_JWT_SECRET || "default_development_secret_do_not_use_in_prod"
);

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export const hashPassword = (password: string): string => {
  return hashSync(password, 10);
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return compareSync(password, hash);
};

export const createAccessToken = async (user: {
  id: number;
  username: string;
}): Promise<string> => {
  return await new SignJWT({
    id: user.id,
    username: user.username,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(SECRET_KEY);
};

export const createRefreshToken = async (user: {
  id: number;
  username: string;
}): Promise<string> => {
  return await new SignJWT({
    id: user.id,
    username: user.username,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(SECRET_KEY);
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (e) {
    return null;
  }
};
