import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { QuoteForm } from "@/components/QuoteForm";
import { getSession } from "@/lib/auth/session";
import { ui } from "@/lib/ui";

export default async function NewQuotePage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <>
      <Header />
      <main className={ui.pageMuted}>
        <div className={`${ui.container} py-10 sm:py-14`}>
          <div className="mb-10">
            <Link
              href="/dashboard"
              className="text-sm text-neutral-500 transition hover:text-neutral-950"
            >
              ← Back to dashboard
            </Link>
            <p className={`${ui.sectionLabel} mt-6`}>New proposal</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Create a client quote
            </h1>
            <p className="mt-2 max-w-2xl text-neutral-500 leading-relaxed">
              Your company details are pre-filled from your account. Add the
              client and job — then share the secure link.
            </p>
          </div>
          <QuoteForm
            defaultBusinessName={session.businessName}
            defaultBusinessEmail={session.email}
          />
        </div>
      </main>
    </>
  );
}
