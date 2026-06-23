import Link from "next/link";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { GettingStarted } from "@/components/dashboard/GettingStarted";
import { SubscriptionBanner } from "@/components/dashboard/SubscriptionBanner";
import { assertActiveSubscription, requireSession } from "@/lib/auth/guards";
import { listQuotes } from "@/lib/quotes-store";

export default async function DashboardPage() {
  const { session, user } = await requireSession();
  assertActiveSubscription(user, true);

  const quotes = await listQuotes(session.userId);

  return (
    <>
      <SubscriptionBanner />
      {quotes.length === 0 ? <GettingStarted /> : null}
      <DashboardOverview quotes={quotes} businessName={session.businessName} />
    </>
  );
}
