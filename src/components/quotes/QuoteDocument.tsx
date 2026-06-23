import {
  depositPence,
  formatDate,
  formatGBP,
  formatQuoteRef,
  quoteTotalPence,
} from "@/lib/format";
import { ui } from "@/lib/ui";
import type { Quote } from "@/lib/types";

export function QuoteDocument({ quote }: { quote: Quote }) {
  const total = quoteTotalPence(quote.lineItems);
  const deposit = depositPence(total, quote.depositPercent);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Quote from
            </p>
            <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
              {formatQuoteRef(quote.id)}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            {quote.businessName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">{quote.businessEmail}</p>
          <p className="mt-2 text-xs text-neutral-400">
            Issued {formatDate(quote.createdAt)}
          </p>
        </div>
      </div>

      <article className={`${ui.card} overflow-hidden`}>
        <div className="border-b border-neutral-100 px-6 py-8 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Proposal
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {quote.jobTitle}
          </h2>
          {quote.jobDescription ? (
            <p className="mt-4 max-w-2xl leading-relaxed text-neutral-600">
              {quote.jobDescription}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
            <span>
              Prepared for{" "}
              <strong className="font-medium text-neutral-950">
                {quote.clientName}
              </strong>
            </span>
            <span>{quote.clientEmail}</span>
          </div>
        </div>

        <div className="hidden px-6 sm:block sm:px-8">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-xs font-medium uppercase tracking-wider text-neutral-400">
                <th className="py-4 font-medium">Description</th>
                <th className="py-4 font-medium">Qty</th>
                <th className="py-4 font-medium">Rate</th>
                <th className="py-4 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-neutral-50">
                  <td className="py-4 text-neutral-950">{item.description}</td>
                  <td className="py-4 tabular-nums text-neutral-600">
                    {item.quantity}
                  </td>
                  <td className="py-4 tabular-nums text-neutral-600">
                    {formatGBP(item.unitPricePence)}
                  </td>
                  <td className="py-4 text-right tabular-nums font-medium text-neutral-950">
                    {formatGBP(item.quantity * item.unitPricePence)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 px-6 py-4 sm:hidden">
          {quote.lineItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4"
            >
              <p className="font-medium text-neutral-950">{item.description}</p>
              <div className="mt-2 flex justify-between text-sm text-neutral-500">
                <span>
                  {item.quantity} × {formatGBP(item.unitPricePence)}
                </span>
                <span className="font-medium tabular-nums text-neutral-950">
                  {formatGBP(item.quantity * item.unitPricePence)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-100 bg-neutral-50/80 px-6 py-6 sm:px-8">
          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatGBP(total)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold text-neutral-950">
              <span>Deposit due ({quote.depositPercent}%)</span>
              <span className="tabular-nums">{formatGBP(deposit)}</span>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
