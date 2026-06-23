import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { GettingStarted } from "@/components/dashboard/GettingStarted";
import { SubscriptionBanner } from "@/components/dashboard/SubscriptionBanner";
import { QuoteStatusBadge } from "@/components/QuoteStatusBadge";
import { getSession } from "@/lib/auth/session";
import { depositPence, formatGBP, quoteTotalPence } from "@/lib/format";
import { listQuotes } from "@/lib/quotes-store";
import { ui } from "@/lib/ui";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const quotes = await listQuotes(session.userId);

  const totalPipeline = quotes.reduce(
    (sum, quote) => sum + quoteTotalPence(quote.lineItems),
    0,
  );
  const paidDeposits = quotes
    .filter((q) => q.status === "deposit_paid")
    .reduce(
      (sum, quote) =>
        sum +
        depositPence(
          quoteTotalPence(quote.lineItems),
          quote.depositPercent,
        ),
      0,
    );
  const awaiting = quotes.filter((q) => q.status === "sent").length;

  return (
    <>
      <Header />
      <main className={ui.pageMuted}>
        <div className={`${ui.container} py-10 sm:py-14`}>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={ui.sectionLabel}>Company dashboard</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {session.businessName}
              </h1>
              <p className="mt-2 max-w-xl text-neutral-500">
                Signed in as {session.email}. Manage quotes and share client
                links from here.
              </p>
            </div>
            <Link href="/dashboard/new" className={ui.btnPrimary}>
              + New quote
            </Link>
          </div>

          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Active quotes",
                value: String(quotes.length),
                hint: "Total in pipeline",
              },
              {
                label: "Awaiting client",
                value: String(awaiting),
                hint: "Need follow-up",
              },
              {
                label: "Deposits secured",
                value: formatGBP(paidDeposits),
                hint: `${formatGBP(totalPipeline)} quoted`,
              },
            ].map((stat) => (
              <div key={stat.label} className={`${ui.card} p-6`}>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{stat.hint}</p>
              </div>
            ))}
          </div>

          <SubscriptionBanner />

          {quotes.length === 0 ? <GettingStarted /> : null}

          {quotes.length === 0 ? (
            <div className={`${ui.cardFlat} border-dashed p-12 text-center sm:p-16`}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-950 text-xl text-white">
                +
              </div>
              <h2 className="mt-6 text-xl font-semibold tracking-tight">
                Create your first quote
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
                Build a professional proposal for your client, share the link,
                and collect a deposit in GBP.
              </p>
              <Link href="/dashboard/new" className={`${ui.btnPrimary} mt-8`}>
                Create quote
              </Link>
            </div>
          ) : (
            <div className={`${ui.card} overflow-hidden`}>
              <div className="border-b border-neutral-100 px-6 py-4">
                <h2 className="font-semibold tracking-tight">Recent quotes</h2>
                <p className="text-sm text-neutral-500">
                  Open a client link to share with your customer.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-neutral-50 text-xs font-medium uppercase tracking-wider text-neutral-400">
                    <tr>
                      <th className="px-6 py-3">Job</th>
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Deposit</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((quote) => {
                      const total = quoteTotalPence(quote.lineItems);
                      const deposit = depositPence(total, quote.depositPercent);
                      return (
                        <tr
                          key={quote.id}
                          className="group border-t border-neutral-100 transition hover:bg-neutral-50/80"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-neutral-950">
                              {quote.jobTitle}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {quote.businessName}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-neutral-600">
                            {quote.clientName}
                          </td>
                          <td className="px-6 py-4 tabular-nums font-medium">
                            {formatGBP(total)}
                          </td>
                          <td className="px-6 py-4 tabular-nums text-neutral-600">
                            {formatGBP(deposit)}
                          </td>
                          <td className="px-6 py-4">
                            <QuoteStatusBadge status={quote.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/q/${quote.id}`}
                              className="text-sm font-medium text-neutral-950 underline-offset-4 transition group-hover:underline"
                            >
                              Client link →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
