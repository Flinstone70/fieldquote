"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/lib/ui";

/**
 * After returning from PayPal, the subscription activates via webhook a moment
 * later. This polls the billing status so the dashboard unlocks on its own —
 * no manual refresh needed.
 */
export function BillingActivation({ initialActive }: { initialActive: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "active" | "pending">(
    initialActive ? "active" : "checking",
  );
  const attempts = useRef(0);

  useEffect(() => {
    if (initialActive) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      attempts.current += 1;
      try {
        const res = await fetch("/api/billing/status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.canCreateQuotes) {
            setState("active");
            clearInterval(interval);
            router.refresh();
            return;
          }
        }
      } catch {
        // ignore transient errors and keep polling
      }

      if (attempts.current >= 20 && !cancelled) {
        setState("pending");
        clearInterval(interval);
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [initialActive, router]);

  if (state === "active") {
    return (
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4">
        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
        <div>
          <p className="font-medium text-emerald-950">Subscription active</p>
          <p className="mt-0.5 text-sm text-emerald-900/80">
            You&apos;re all set — your workspace is fully unlocked.
          </p>
        </div>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className={`${ui.cardMuted} mb-8 p-5`}>
        <p className="text-sm text-neutral-600">
          PayPal has your approval. Activation is taking a little longer than
          usual — it&apos;ll update automatically, or refresh in a minute.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 flex items-center gap-3 rounded-2xl border border-neutral-950 bg-neutral-950 px-5 py-4 text-white">
      <Spinner />
      <div>
        <p className="font-medium">Confirming your payment…</p>
        <p className="mt-0.5 text-sm text-neutral-400">
          PayPal approved — unlocking your workspace now. This page updates on its
          own.
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 shrink-0 animate-spin text-white"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}
