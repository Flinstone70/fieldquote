import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/jwt";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PAGES = ["/sign-in", "/sign-up", "/verify-email", "/verify-login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

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

  if (isAuthPage && session?.emailVerified) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up",
    "/verify-email",
    "/verify-login",
  ],
};
