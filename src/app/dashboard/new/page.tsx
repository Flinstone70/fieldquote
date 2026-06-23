import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { QuoteForm } from "@/components/QuoteForm";
import { assertActiveSubscription, requireSession } from "@/lib/auth/guards";

export default async function NewQuotePage() {
  const { session, user } = await requireSession();
  assertActiveSubscription(user);

  return (
    <>
      <DashboardPageHeader
        crumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "New quote" },
        ]}
        title="Create a client quote"
        description="Add the client and job details, then email the secure link straight to them."
      />
      <QuoteForm
        defaultBusinessName={session.businessName}
        defaultBusinessEmail={session.email}
      />
    </>
  );
}
