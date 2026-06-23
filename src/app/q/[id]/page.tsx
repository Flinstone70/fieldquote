import Link from "next/link";
import { Header } from "@/components/Header";
import { ClientQuoteView } from "@/components/ClientQuoteView";
import { getSession } from "@/lib/auth/session";
import { getQuote, getQuoteForUser, updateQuoteStatus } from "@/lib/quotes-store";
import { ui } from "@/lib/ui";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; preview?: string }>;
};

function normalizeQuoteId(raw: string): string {
  return decodeURIComponent(raw).trim();
}

export default async function QuotePage({ params, searchParams }: PageProps) {
  const { id: rawId } = await params;
  const id = normalizeQuoteId(rawId);
  const { paid, preview } = await searchParams;

  const session = await getSession();
  if (session && preview !== "1") {
    const owned = await getQuoteForUser(id, session.userId);
    if (owned) {
      redirect(`/dashboard/quotes/${id}`);
    }
  }

  let quote;
  try {
    quote = await getQuote(id);
  } catch (error) {
    console.error("Failed to load quote:", error);
    return (
      <>
        <Header />
        <main className={`${ui.page} py-10 sm:py-14`}>
          <div className="mx-auto max-w-lg px-5 text-center sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-400">
              Quote unavailable
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              We couldn&apos;t load this quote
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              The server could not reach the database. If you are the business
              owner, check DATABASE_URL on Vercel and redeploy.
            </p>
            <Link href="/" className={`${ui.btnPrimary} mt-8 inline-flex`}>
              Back home
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (!quote) {
    return (
      <>
        <Header />
        <main className={`${ui.page} py-10 sm:py-14`}>
          <div className="mx-auto max-w-lg px-5 text-center sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-400">
              Quote not found
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              This quote link is invalid or expired
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Ask the company that sent you the quote to resend it from their
              FieldQuote dashboard. Links only work when sent from the live site
              with the database connected.
            </p>
            <Link href="/" className={`${ui.btnPrimary} mt-8 inline-flex`}>
              Back home
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (paid === "1" && quote.status !== "deposit_paid") {
    quote =
      (await updateQuoteStatus(id, "deposit_paid", {
        depositPaidAt: new Date().toISOString(),
        acceptedAt: quote.acceptedAt ?? new Date().toISOString(),
      })) ?? quote;
  }

  return (
    <>
      <Header />
      <main className={`${ui.page} py-10 sm:py-14`}>
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <ClientQuoteView quote={quote} paid={paid === "1"} />
        </div>
      </main>
    </>
  );
}
