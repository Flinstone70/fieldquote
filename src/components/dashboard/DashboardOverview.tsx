import Link from "next/link";
import { depositPence, formatGBP, formatDate, quoteTotalPence } from "@/lib/format";
import type { Quote } from "@/lib/types";
import { ui } from "@/lib/ui";
import { QuoteStatusBadge } from "../QuoteStatusBadge";

export function DashboardOverview({
  quotes,
  businessName,
}: {
  quotes: Quote[];
  businessName: string;
}) {
  const awaiting = quotes.filter((q) => q.status === "sent").length;
  const pending = quotes.filter((q) => q.status === "accepted").length;
  const paid = quotes.filter((q) => q.status === "deposit_paid").length;
  const declined = quotes.filter((q) => q.status === "declined").length;
  const totalPipeline = quotes.reduce(
    (sum, quote) => sum + quoteTotalPence(quote.lineItems),
    0,
  );
  const paidDeposits = quotes
    .filter((q) => q.status === "deposit_paid")
    .reduce(
      (sum, quote) =>
        sum + depositPence(quoteTotalPence(quote.lineItems), quote.depositPercent),
      0,
    );

  const stats = [
    { label: "Active quotes", value: String(quotes.length), hint: "In your pipeline" },
    { label: "Waiting for client", value: String(awaiting), hint: "No response yet" },
    { label: "Payment pending", value: String(pending), hint: "Accepted, not paid" },
    { label: "Deposits secured", value: formatGBP(paidDeposits), hint: `${paid} paid · ${declined} declined` },
  ];

  const quickActions = [
    {
      title: "Create a new quote",
      body: "Build a proposal and email it to your client in one flow.",
      href: "/dashboard/new",
      cta: "Start quote",
    },
    {
      title: "Share your demo page",
      body: "Show prospects exactly what clients see when they receive a quote.",
      href: "/demo",
      cta: "Open demo",
    },
    {
      title: "Manage subscription",
      body: "View trial status, PayPal billing, and plan details.",
      href: "/dashboard/billing",
      cta: "View billing",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className={ui.sectionLabel}>Overview</p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back, {businessName}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Track client responses, send quotes, and monitor deposits from one secure
          workspace. Only your team can access this dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${ui.card} p-5`}>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`${ui.card} group flex h-full flex-col p-6`}
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
              Quick action
            </p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{action.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500">
              {action.body}
            </p>
            <span className="mt-5 text-sm font-medium text-neutral-950 transition group-hover:text-amber-800">
              {action.cta} →
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className={`${ui.card} overflow-hidden`}>
          <div className="border-b border-neutral-100 px-6 py-4">
            <h3 className="font-semibold tracking-tight">Recent quotes</h3>
            <p className="text-sm text-neutral-500">
              {formatGBP(totalPipeline)} total quoted value in pipeline
            </p>
          </div>
          {quotes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-neutral-500">No quotes yet.</p>
              <Link href="/dashboard/new" className={`${ui.btnPrimary} mt-4 inline-flex`}>
                Create your first quote
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {quotes.slice(0, 6).map((quote) => {
                const total = quoteTotalPence(quote.lineItems);
                const deposit = depositPence(total, quote.depositPercent);
                return (
                  <Link
                    key={quote.id}
                    href={`/dashboard/quotes/${quote.id}`}
                    className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition hover:bg-neutral-50"
                  >
                    <div>
                      <p className="font-medium text-neutral-950">{quote.jobTitle}</p>
                      <p className="text-sm text-neutral-500">
                        {quote.clientName} · {formatDate(quote.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="font-medium tabular-nums">{formatGBP(total)}</p>
                        <p className="text-neutral-500 tabular-nums">
                          {formatGBP(deposit)} deposit
                        </p>
                      </div>
                      <QuoteStatusBadge status={quote.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className={`${ui.cardFlat} border-neutral-950 bg-neutral-950 p-6 text-white`}>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-400">
              Security
            </p>
            <h3 className="mt-2 text-lg font-semibold">Your account is protected</h3>
            <ul className="mt-4 space-y-3 text-sm text-neutral-300">
              <li className="flex gap-2">
                <span className="text-amber-400">✓</span>
                Work email verified on sign-up
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">✓</span>
                One-time passcode required every sign-in
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">✓</span>
                Quotes isolated to your company only
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">✓</span>
                HttpOnly session cookies — no shared access
              </li>
            </ul>
          </div>

          <div className={`${ui.card} p-6`}>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Pipeline snapshot
            </p>
            <div className="mt-4 space-y-3">
              {[
                { label: "Waiting for client", value: awaiting, tone: "bg-neutral-950" },
                { label: "Payment pending", value: pending, tone: "bg-amber-500" },
                { label: "Deposit paid", value: paid, tone: "bg-emerald-600" },
                { label: "Declined", value: declined, tone: "bg-neutral-300" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-neutral-600">{row.label}</span>
                    <span className="font-medium tabular-nums">{row.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${row.tone}`}
                      style={{
                        width: `${quotes.length ? Math.max(8, (row.value / quotes.length) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
