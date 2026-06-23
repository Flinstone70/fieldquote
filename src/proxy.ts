import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest, verifyToken } from "@/lib/auth/jwt";
import { hasActiveSubscription } from "@/lib/subscription";
import type { SessionUser } from "@/lib/types";

const PROTECTED_PREFIXES = ["/dashboard"];
const VERIFY_PAGES = ["/verify-email", "/verify-login"];
const PENDING_COOKIE = "fq_pending";

function subscriptionActive(session: SessionUser): boolean {
  return hasActiveSubscription({
    id: session.userId,
    email: session.email,
    passwordHash: "",
    businessName: session.businessName,
    emailVerified: session.emailVerified,
    createdAt: "",
    trialEndsAt: session.trialEndsAt,
    subscriptionPlan: session.subscriptionPlan,
    subscriptionStatus: session.subscriptionStatus,
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isVerifyPage = VERIFY_PAGES.some((page) => pathname.startsWith(page));

  if (isProtected && !session) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isProtected && session && !session.emailVerified) {
    const url = new URL("/verify-email", request.url);
    url.searchParams.set("email", session.email);
    return NextResponse.redirect(url);
  }

  if (
    isProtected &&
    session &&
    !subscriptionActive(session) &&
    !pathname.startsWith("/dashboard/billing")
  ) {
    const url = new URL("/dashboard/billing", request.url);
    url.searchParams.set("reason", "subscription_required");
    return NextResponse.redirect(url);
  }

  if (isVerifyPage) {
    const pendingToken = request.cookies.get(PENDING_COOKIE)?.value;
    const pending = pendingToken
      ? await verifyToken<{ purpose: string }>(pendingToken)
      : null;

    if (!pending) {
      const url = new URL("/sign-in", request.url);
      url.searchParams.set("reason", "verification_required");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/verify-email", "/verify-login"],
};
