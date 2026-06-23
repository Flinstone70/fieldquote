import { DashboardBackLink } from "@/components/dashboard/DashboardBackLink";
import { QuoteForm } from "@/components/QuoteForm";
import { assertActiveSubscription, requireSession } from "@/lib/auth/guards";
import { ui } from "@/lib/ui";

export default async function NewQuotePage() {
  const { session, user } = await requireSession();
  assertActiveSubscription(user);

  return (
    <>
      <div className="mb-8">
        <DashboardBackLink />
        <p className={`${ui.sectionLabel} block`}>New proposal</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Create a client quote
        </h2>
        <p className="mt-2 max-w-2xl text-neutral-500 leading-relaxed">
          Your company details are pre-filled. Add the client and job, then email
          the secure link straight to them.
        </p>
      </div>
      <QuoteForm
        defaultBusinessName={session.businessName}
        defaultBusinessEmail={session.email}
      />
    </>
  );
}
