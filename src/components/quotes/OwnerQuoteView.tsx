import { DashboardBackLink } from "@/components/dashboard/DashboardBackLink";
import { QuoteDocument } from "@/components/quotes/QuoteDocument";
import { QuoteStatusTimeline } from "@/components/quotes/QuoteStatusTimeline";
import { SendQuotePanel } from "@/components/quotes/SendQuotePanel";
import { QuoteStatusBadge } from "@/components/QuoteStatusBadge";
import {
  depositPence,
  formatGBP,
  formatQuoteRef,
  quoteTotalPence,
} from "@/lib/format";
import { ui } from "@/lib/ui";
import type { Quote } from "@/lib/types";

export function OwnerQuoteView({
  quote,
  justCreated = false,
  emailSent = false,
}: {
  quote: Quote;
  justCreated?: boolean;
  emailSent?: boolean;
}) {
  const total = quoteTotalPence(quote.lineItems);
  const deposit = depositPence(total, quote.depositPercent);

  return (
    <div className="space-y-8">
      {justCreated ? (
        <div className="animate-fade-up rounded-2xl border border-neutral-950 bg-neutral-950 px-5 py-4 text-white">
          <p className="font-medium">Quote created</p>
          <p className="mt-1 text-sm text-neutral-400">
            This is your company view. Send the quote to your client — they are
            the ones who accept and pay the deposit.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <DashboardBackLink />
          <p className={`${ui.sectionLabel} block`}>Quote management</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {quote.jobTitle}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {formatQuoteRef(quote.id)} · Client: {quote.clientName}
          </p>
        </div>
        <QuoteStatusBadge status={quote.status} />
      </div>

      <QuoteStatusTimeline status={quote.status} />

      <SendQuotePanel
        quoteId={quote.id}
        clientEmail={quote.clientEmail}
        clientName={quote.clientName}
        initiallySent={emailSent}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Quote total", value: formatGBP(total) },
          { label: "Deposit due", value: formatGBP(deposit) },
          {
            label: "Your role",
            value: "Send & track",
            hint: "Client pays deposit",
          },
        ].map((item) => (
          <div key={item.label} className={`${ui.cardFlat} p-5`}>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              {item.label}
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{item.value}</p>
            {item.hint ? (
              <p className="mt-1 text-xs text-neutral-500">{item.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div>
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
          Quote preview (what your client sees)
        </p>
        <QuoteDocument quote={quote} />
      </div>
    </div>
  );
}
