import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { hasActiveSubscription, subscriptionLabel } from "@/lib/subscription";
import { ui } from "@/lib/ui";

export async function SubscriptionBanner() {
  const session = await getSession();
  if (!session) return null;

  const user = await findUserById(session.userId);
  if (!user) return null;

  if (hasActiveSubscription(user) && user.subscriptionStatus === "active") {
    return null;
  }

  const active = hasActiveSubscription(user);

  return (
    <div
      className={`mb-8 rounded-2xl border p-5 ${
        active
          ? "border-neutral-200 bg-white"
          : "border-neutral-950 bg-neutral-950 text-white"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider opacity-70">
            Subscription
          </p>
          <p className="mt-1 font-semibold">{subscriptionLabel(user)}</p>
          {!active ? (
            <p className="mt-1 text-sm opacity-80">
              Subscribe with PayPal to keep creating client quotes.
            </p>
          ) : null}
        </div>
        <Link
          href="/dashboard/billing"
          className={
            active
              ? ui.btnSecondary
              : "inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950"
          }
        >
          {active ? "View billing" : "Subscribe with PayPal"}
        </Link>
      </div>
    </div>
  );
}
