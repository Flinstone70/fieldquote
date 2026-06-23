import { cache } from "react";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { clearAuthCookies, getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { getQuoteForUser } from "@/lib/quotes-store";
import { hasActiveSubscription } from "@/lib/subscription";
import type { Quote, SessionUser, User } from "@/lib/types";

export const requireSession = cache(async (): Promise<{
  session: SessionUser;
  user: User;
}> => {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in?reason=auth_required");
  }

  const user = await findUserById(session.userId);
  if (!user || !user.emailVerified) {
    await clearAuthCookies();
    redirect("/sign-in?reason=session_invalid");
  }

  return { session, user };
});

export async function requireSessionApi(): Promise<
  | { session: SessionUser; user: User; error?: never }
  | { session?: never; user?: never; error: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorised." }, { status: 401 }),
    };
  }

  const user = await findUserById(session.userId);
  if (!user || !user.emailVerified) {
    await clearAuthCookies();
    return {
      error: NextResponse.json({ error: "Unauthorised." }, { status: 401 }),
    };
  }

  return { session, user };
}

export async function requireQuoteOwner(quoteId: string): Promise<{
  session: SessionUser;
  user: User;
  quote: Quote;
}> {
  const { session, user } = await requireSession();
  const quote = await getQuoteForUser(quoteId, session.userId);
  if (!quote) {
    redirect("/dashboard");
  }
  return { session, user, quote };
}

export function assertActiveSubscription(user: User, allowBilling = false): void {
  if (hasActiveSubscription(user)) return;
  if (allowBilling) return;
  redirect("/dashboard/billing?reason=subscription_required");
}
