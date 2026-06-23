import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  createSessionTokenForUser,
  getPendingAuth,
  setSessionCookie,
} from "@/lib/auth/session";
import { markEmailVerified, verifyOtp } from "@/lib/auth/users";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const pending = await getPendingAuth();
    if (!pending || pending.purpose !== "email_verify") {
      return NextResponse.json(
        { error: "Verification session expired. Sign up again or request a new code." },
        { status: 401 },
      );
    }

    const limit = await rateLimit(
      `verify-email:${pending.userId}:${getClientIp(request)}`,
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
      purpose: "email_verify",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const user = await markEmailVerified(result.user.id);
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
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
