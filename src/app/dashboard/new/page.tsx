import Link from "next/link";
import { assertActiveSubscription, requireSession } from "@/lib/auth/guards";
import { QuoteForm } from "@/components/QuoteForm";
import { ui } from "@/lib/ui";

export default async function NewQuotePage() {
  const { session, user } = await requireSession();
  assertActiveSubscription(user);

  return (
    <>
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
        >
          ← Back to overview
        </Link>
        <p className={`${ui.sectionLabel} mt-6`}>New proposal</p>
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
