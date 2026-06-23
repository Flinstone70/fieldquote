import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  createSessionTokenForUser,
  getPendingAuth,
  setSessionCookie,
} from "@/lib/auth/session";
import { findUserById, verifyOtp } from "@/lib/auth/users";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const pending = await getPendingAuth();
    if (!pending || pending.purpose !== "login") {
      return NextResponse.json(
        { error: "Sign-in session expired. Please sign in again." },
        { status: 401 },
      );
    }

    const limit = await rateLimit(
      `verify-login:${pending.userId}:${getClientIp(request)}`,
      15,
      600,
    );
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please request a new code shortly." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const code = String(body.code ?? "").trim();

    const result = await verifyOtp({
      userId: pending.userId,
      code,
      purpose: "login",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const user = await findUserById(result.user.id);
    if (!user || !user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in." },
        { status: 403 },
      );
    }

    await clearAuthCookies();
    await setSessionCookie(await createSessionTokenForUser(user));

    return NextResponse.json({ ok: true, redirect: "/dashboard" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
