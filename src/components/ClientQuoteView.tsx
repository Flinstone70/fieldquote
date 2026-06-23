"use client";

import { useEffect, useState } from "react";
import {
  depositPence,
  formatGBP,
  quoteTotalPence,
} from "@/lib/format";
import { ui } from "@/lib/ui";
import type { Quote } from "@/lib/types";
import { QuoteDocument } from "./quotes/QuoteDocument";
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
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus(quote.status);
  }, [quote.status]);

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

  async function declineQuote() {
    if (demo) return;
    setDeclining(true);
    setError("");
    try {
      const response = await fetch(`/api/quotes/${quote.id}/decline`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not decline quote");
      setStatus(data.quote.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeclining(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      {demo ? (
        <div className="mb-8 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4">
          <p className="text-sm font-medium text-neutral-950">Demo mode</p>
          <p className="mt-1 text-sm text-neutral-500">
            This is a sample quote for sales demos. Create your own in minutes from
            the dashboard.
          </p>
        </div>
      ) : null}

      <div className="mb-6 flex justify-end">
        <QuoteStatusBadge status={showPaidBanner ? "deposit_paid" : status} />
      </div>

      {showPaidBanner ? (
        <div className="mb-8 animate-fade-in rounded-2xl border border-neutral-950 bg-neutral-950 px-5 py-4 text-white">
          <p className="font-medium">Deposit confirmed</p>
          <p className="mt-1 text-sm text-neutral-400">
            Thank you. {quote.businessName} will contact you shortly to schedule
            the work.
          </p>
        </div>
      ) : null}

      {status === "declined" ? (
        <div className="mb-8 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4">
          <p className="font-medium text-neutral-950">Quote declined</p>
          <p className="mt-1 text-sm text-neutral-500">
            You chose not to proceed. Contact {quote.businessName} if you change
            your mind.
          </p>
        </div>
      ) : null}

      <QuoteDocument quote={quote} />

      {status === "sent" && !demo ? (
        <div className="mt-8 space-y-4 animate-fade-up animate-delay-100">
          <p className="text-sm text-neutral-500">
            By accepting, you agree to pay the deposit to secure this booking with{" "}
            {quote.businessName}.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={acceptQuote}
              disabled={loading || declining}
              className={`${ui.btnPrimary} flex-1 sm:flex-none`}
            >
              {loading
                ? "Processing..."
                : `Accept & pay ${formatGBP(deposit)} deposit`}
            </button>
            <button
              onClick={declineQuote}
              disabled={loading || declining}
              className={ui.btnSecondary}
            >
              {declining ? "Declining..." : "Decline quote"}
            </button>
          </div>
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
        <p className="mt-6 animate-fade-in rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          Quote accepted. Complete your deposit payment to confirm the booking.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
