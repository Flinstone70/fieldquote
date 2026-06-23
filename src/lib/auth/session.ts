import { userToSession } from "@/lib/db/mappers";
import { findUserById } from "@/lib/auth/users";
import type { SessionUser, User } from "@/lib/types";
import {
  createSessionToken,
  readSessionCookieToken,
  verifyToken,
} from "@/lib/auth/jwt";

export {
  clearAuthCookies,
  createPendingToken,
  createSessionToken,
  getPendingAuth,
  getSessionFromRequest,
  setPendingCookie,
  setSessionCookie,
} from "@/lib/auth/jwt";

export async function createSessionTokenForUser(user: User): Promise<string> {
  return createSessionToken(userToSession(user));
}

export async function getSession(): Promise<SessionUser | null> {
  const token = await readSessionCookieToken();
  if (!token) return null;

  const payload = await verifyToken<SessionUser>(token);
  if (!payload?.userId) return null;

  const user = await findUserById(payload.userId);
  if (!user) return null;

  return userToSession(user);
}
