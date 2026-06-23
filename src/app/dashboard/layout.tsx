import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { SubscriptionEnforcer } from "@/components/dashboard/SubscriptionEnforcer";
import { requireSession } from "@/lib/auth/guards";
import { ui } from "@/lib/ui";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, user } = await requireSession();

  return (
    <>
      <Header app />
      <SubscriptionEnforcer trialEndsAt={user.trialEndsAt} status={user.subscriptionStatus} />
      <div className={ui.pageMuted}>
        <div className={`${ui.container} py-8 sm:py-10`}>
          <DashboardNav
            businessName={session.businessName}
            email={session.email}
            subscriptionStatus={user.subscriptionStatus}
            trialEndsAt={user.trialEndsAt}
          />
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </>
  );
}
