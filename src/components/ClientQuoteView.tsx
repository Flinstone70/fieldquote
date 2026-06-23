"use client";

import { useEffect, useState } from "react";
import {
  depositPence,
  formatDate,
  formatGBP,
  formatQuoteRef,
  quoteTotalPence,
} from "@/lib/format";
import { ui } from "@/lib/ui";
import type { Quote } from "@/lib/types";
import { QuoteStatusBadge } from "./QuoteStatusBadge";

export function ClientQuoteView({
  quote,
  paid,
  demo = false,
}: {
  quote: Quote;
  paid?: boolean;
  demo?: boolean;
}) {
  const [status, setStatus] = useState(quote.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (!demo) setShareUrl(window.location.href);
  }, [demo]);

  const total = quoteTotalPence(quote.lineItems);
  const deposit = depositPence(total, quote.depositPercent);
  const showPaidBanner = paid || status === "deposit_paid";

  async function acceptQuote() {
    if (demo) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/quotes/${quote.id}/accept`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not accept quote");

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setStatus(data.quote.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    const url = demo ? `${window.location.origin}/demo` : window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl">
      {demo ? (
        <div className="mb-8 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4">
          <p className="text-sm font-medium text-neutral-950">Demo mode</p>
          <p className="mt-1 text-sm text-neutral-500">
            This is a sample quote for sales demos. Create your own in minutes from
            the dashboard.
          </p>
        </div>
      ) : null}

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
        <QuoteStatusBadge status={showPaidBanner ? "deposit_paid" : status} />
      </div>

      {showPaidBanner ? (
        <div className="mb-8 rounded-2xl border border-neutral-950 bg-neutral-950 px-5 py-4 text-white">
          <p className="font-medium">Deposit confirmed</p>
          <p className="mt-1 text-sm text-neutral-400">
            Thank you. {quote.businessName} will contact you shortly to schedule
            the work.
          </p>
        </div>
      ) : null}

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

      {status === "sent" && !demo ? (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-500">
            By accepting, you agree to pay the deposit to secure this booking.
          </p>
          <button
            onClick={acceptQuote}
            disabled={loading}
            className={`${ui.btnPrimary} shrink-0`}
          >
            {loading
              ? "Processing..."
              : `Accept & pay ${formatGBP(deposit)} deposit`}
          </button>
        </div>
      ) : null}

      {demo ? (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-500">
            In a live quote, your client clicks here to accept and pay securely.
          </p>
          <span className={`${ui.btnPrimary} shrink-0 cursor-default opacity-90`}>
            Accept & pay {formatGBP(deposit)} deposit
          </span>
        </div>
      ) : null}

      {status === "accepted" && !showPaidBanner ? (
        <p className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          Quote accepted. Complete your deposit payment to confirm the booking.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {error}
        </p>
      ) : null}

      {!demo ? (
        <div className={`${ui.cardMuted} mt-10 p-5`}>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            Share with client
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Send this link by text or email so your client can review and pay.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <code className="flex-1 break-all rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs text-neutral-600">
              {shareUrl || `/q/${quote.id}`}
            </code>
            <button onClick={copyLink} className={ui.btnSecondary}>
              {copied ? "Copied ✓" : "Copy link"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
